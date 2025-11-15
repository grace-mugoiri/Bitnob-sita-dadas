import requests
import os
from dotenv import load_dotenv

load_dotenv()

class BitnobService:
    def __init__(self):
        self.api_key = os.getenv('BITNOB_API_KEY')
        self.api_secret = os.getenv('BITNOB_API_SECRET')
        self.base_url = os.getenv('BITNOB_BASE_URL', 'https://api.bitnob.com/v1')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def create_invoice(self, amount_btc, description, customer_email, callback_url, metadata=None):
        """
        Create a Bitcoin payment invoice
        """
        payload = {
            'description': description,
            'amount': amount_btc,
            'currency': 'BTC',
            'customerEmail': customer_email,
            'callbackUrl': callback_url,
            'successUrl': f"{os.getenv('FRONTEND_URL')}/payment-success",
            'metadata': metadata or {}
        }

        try:
            response = requests.post(
                f'{self.base_url}/invoices',
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def create_lightning_invoice(self, amount_sats, description, expiry=3600):
        """
        Create a Lightning Network invoice
        """
        payload = {
            'amount': amount_sats,  # Amount in satoshis
            'description': description,
            'expiry': expiry  # Expires in seconds
        }

        try:
            response = requests.post(
                f'{self.base_url}/ln/createinvoice',
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_invoice_status(self, invoice_id):
        """
        Check the status of an invoice
        """
        try:
            response = requests.get(
                f'{self.base_url}/invoices/{invoice_id}',
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return {
                'success': True,
                'status': data.get('data', {}).get('status'),
                'data': data
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def send_bitcoin(self, amount_btc, address, description):
        """
        Send Bitcoin to an address (release escrow to seller)
        """
        payload = {
            'amount': amount_btc,
            'address': address,
            'description': description,
            'priority': 'medium'
        }

        try:
            response = requests.post(
                f'{self.base_url}/wallets/send',
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def send_lightning(self, payment_request, amount_sats=None):
        """
        Send Lightning payment
        """
        payload = {
            'payment_request': payment_request
        }
        if amount_sats:
            payload['amount'] = amount_sats

        try:
            response = requests.post(
                f'{self.base_url}/ln/sendpayment',
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_wallet_balance(self):
        """
        Get platform wallet balance
        """
        try:
            response = requests.get(
                f'{self.base_url}/wallets/balance',
                headers=self.headers
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_transaction_history(self, limit=50):
        """
        Get wallet transaction history
        """
        try:
            response = requests.get(
                f'{self.base_url}/wallets/transactions',
                headers=self.headers,
                params={'limit': limit}
            )
            response.raise_for_status()
            return {
                'success': True,
                'data': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }
