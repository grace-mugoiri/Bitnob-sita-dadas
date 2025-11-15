import { useState } from 'react';
import {
  Moon,
  Sun,
  Globe,
  Eye,
  EyeOff,
  DollarSign,
  Settings as SettingsIcon,
} from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'English',
    hideDetails: false,
    currency: 'BTC',
  });

  const toggleDarkMode = () => {
    setSettings({ ...settings, darkMode: !settings.darkMode });
  };

  const toggleHideDetails = () => {
    setSettings({ ...settings, hideDetails: !settings.hideDetails });
  };

  const handleLanguageChange = (e) => {
    setSettings({ ...settings, language: e.target.value });
  };

  const handleCurrencyChange = (e) => {
    setSettings({ ...settings, currency: e.target.value });
  };

  return (
    <div className="settings-container">
      <div className="settings-actions">
        <button className="save-button">Save Changes</button>
        <button className="reset-button">Reset to Default</button>
      </div>
      <h1>Settings</h1>
      <p className="subtitle">Customize your app preferences</p>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                {settings.darkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h3>Dark Mode</h3>
                <p>Toggle between light and dark theme</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={toggleDarkMode}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <Globe size={24} />
              </div>
              <div>
                <h3>Language</h3>
                <p>Select your preferred language</p>
              </div>
            </div>
            <select
              className="setting-select"
              value={settings.language}
              onChange={handleLanguageChange}
            >
              <option value="English">English</option>
              <option value="Swahili">Swahili</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                {settings.hideDetails ? (
                  <EyeOff size={24} />
                ) : (
                  <Eye size={24} />
                )}
              </div>
              <div>
                <h3>Hide Details</h3>
                <p>Hide sensitive information</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.hideDetails}
                onChange={toggleHideDetails}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <DollarSign size={24} />
              </div>
              <div>
                <h3>Currency</h3>
                <p>Choose your display currency</p>
              </div>
            </div>
            <select
              className="setting-select"
              value={settings.currency}
              onChange={handleCurrencyChange}
            >
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="KES">KES (Kenyan Shilling)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
