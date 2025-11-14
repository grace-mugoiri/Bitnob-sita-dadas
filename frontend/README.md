# Escrow Pay - Bitcoin Delivery Platform

A secure escrow-based delivery payment system that accepts Bitcoin/Lightning payments. Built with React and Vite.

## Features

### Buyer Side
- **Dashboard**: Monitor orders with real-time status updates
  - Orders with statuses: Not Yet Arrived, In Escrow, Pending, Delivery

- **Make Order**: Create new orders with escrow payment
  - BTC payment integration
  - Delivery information
  - Rider/organization details

- **Tracker**: Real-time delivery tracking
  - Live map visualization
  - Rider location updates
  - Contact rider (Call/WhatsApp)

- **History**: View past orders
  - Filter by status (All, Completed, Uncompleted)
  - Order statistics
  - Delivery details

- **Settings**: Customize preferences
  - Dark mode toggle
  - Language selection
  - Currency preferences
  - Privacy controls

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Lucide React** - Icons
- **CSS3** - Styling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.jsx
│   └── Sidebar.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── MakeOrder.jsx
│   ├── Tracker.jsx
│   ├── History.jsx
│   └── Settings.jsx
├── styles/          # CSS files
│   ├── Dashboard.css
│   ├── MakeOrder.css
│   ├── Tracker.css
│   ├── History.css
│   ├── Settings.css
│   ├── Sidebar.css
│   └── Layout.css
├── App.jsx          # Main app component with routing
└── main.jsx         # Entry point
```

## Design System

### Colors
- **Primary**: `#14b8a6` (Teal)
- **Primary Dark**: `#0d9488`
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)
- **Background**: `#f9fafb`

## Next Steps

### Integration with Bitnob API
The payment functionality in `MakeOrder.jsx` is ready for Bitnob API integration. Update the `handleSubmit` function to connect with the API.

### Features to Add
- User authentication
- Real-time WebSocket updates for tracking
- Push notifications
- Lightning Network integration
- Multi-signature escrow contracts
- Dispute resolution system

## Use Cases

1. **Secure Online Shopping**: Protect buyers from scam shops by holding payments in escrow
2. **Delivery Verification**: Release payment only when package is confirmed delivered
3. **Wrong Product Protection**: Return funds if wrong product is delivered
4. **Driver Accountability**: Prevent delivery drivers from stealing packages/meals

## License

MIT
