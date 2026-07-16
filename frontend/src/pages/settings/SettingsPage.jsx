/**
 * pages/settings/SettingsPage.jsx
 * ---------------------------------
 * Enterprise Settings page with tabbed navigation.
 * Matches Dashboard/Projects/Tasks UI theme exactly.
 */

import React, { useState, useEffect } from 'react';
import {
  LuSettings, LuUser, LuPalette, LuShield, LuBell,
  LuUsers, LuServer, LuInfo, LuSave, LuRotateCcw,
} from 'react-icons/lu';

import DashboardLayout from '../../components/Layouts/DashboardLayout';
import settingsService from '../../services/settingsService';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import styles from './SettingsPage.module.css';

const ALL_TABS = [
  { id: 'general', label: 'General', icon: LuSettings },
  { id: 'profile', label: 'Profile', icon: LuUser },
  { id: 'account', label: 'Account', icon: LuUser },
  { id: 'security', label: 'Security', icon: LuShield },
  { id: 'appearance', label: 'Appearance', icon: LuPalette },
  { id: 'notifications', label: 'Notifications', icon: LuBell },
  { id: 'roles', label: 'Roles & Permissions', icon: LuUsers, adminOnly: true },
  { id: 'system', label: 'System', icon: LuServer, adminOnly: true },
  { id: 'about', label: 'About', icon: LuInfo },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter tabs based on user role
  const TABS = user?.role === 'Admin' ? ALL_TABS : ALL_TABS.filter(tab => !tab.adminOnly);

  // ── General ──
  const [general, setGeneral] = useState({
    company_name: '',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    week_start: 'monday',
  });

// ── Profile ──
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    bio: '',
    avatar: '',
  });

  // ── Account ──
  const [account, setAccount] = useState({
    username: '',
    email: '',
    status: 'Active',
    created_at: '',
    last_login: '',
  });

  // ── Security ──
  const [security, setSecurity] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout_minutes: 60,
  });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loginHistory, setLoginHistory] = useState([]);

  // ── Appearance ──
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accent_color: '#8b5cf6',
    sidebar_style: 'expanded',
    compact_mode: false,
    animations_enabled: true,
    font_size: 'medium',
  });

  // ── Notifications ──
  const [notifications, setNotifications] = useState({
    email_enabled: true,
    browser_enabled: true,
    desktop_enabled: false,
    task_reminders: true,
    meeting_reminders: true,
    deadline_reminders: true,
    project_updates: true,
    mention_alerts: true,
    push_notifications: false,
    muted: false,
  });

  // ── Roles & Permissions ──
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // ── System ──
  const [systemInfo, setSystemInfo] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profileData, prefsData, securityData, notifData, rolesData, permsData, systemData] = await Promise.allSettled([
        settingsService.getProfile(),
        settingsService.getPreferences(),
        settingsService.getSecurity(),
        settingsService.getNotificationPreferences(),
        settingsService.getRoles(),
        settingsService.getPermissions(),
        settingsService.getSystemInfo(),
      ]);

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
        setAccount({
          username: profileData.value.email?.split('@')[0] || '',
          email: profileData.value.email || '',
          status: profileData.value.status || 'Active',
          created_at: profileData.value.created_at || '',
          last_login: '',
        });
      }
      if (prefsData.status === 'fulfilled') {
        setGeneral({
          timezone: prefsData.value.timezone || 'UTC',
          language: prefsData.value.language || 'en',
          currency: prefsData.value.currency || 'USD',
          date_format: prefsData.value.date_format || 'MM/DD/YYYY',
          time_format: prefsData.value.time_format || '12h',
          week_start: prefsData.value.week_start || 'monday',
        });
        setAppearance({
          theme: prefsData.value.theme || 'dark',
          accent_color: prefsData.value.accent_color || '#8b5cf6',
          sidebar_style: prefsData.value.sidebar_style || 'expanded',
          compact_mode: prefsData.value.compact_mode || false,
          animations_enabled: prefsData.value.animations_enabled ?? true,
          font_size: prefsData.value.font_size || 'medium',
        });
      }
      if (securityData.status === 'fulfilled') {
        setSecurity(securityData.value);
      }
      if (notifData.status === 'fulfilled') {
        setNotifications(notifData.value);
      }
      if (rolesData.status === 'fulfilled') {
        setRoles(rolesData.value);
      }
      if (permsData.status === 'fulfilled') {
        setPermissions(permsData.value);
      }
      if (systemData.status === 'fulfilled') {
        setSystemInfo(systemData.value);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      switch (section) {
        case 'general':
          await settingsService.updatePreferences(general);
          toast.success('General settings saved');
          break;
        case 'profile':
          await settingsService.updateProfile(profile);
          toast.success('Profile updated');
          break;
        case 'security':
          await settingsService.updateSecurity(security);
          toast.success('Security settings saved');
          break;
        case 'appearance':
          await settingsService.updatePreferences(appearance);
          toast.success('Appearance preferences saved');
          break;
        case 'notifications':
          await settingsService.updateNotificationPreferences(notifications);
          toast.success('Notification preferences saved');
          break;
        default:
          break;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await settingsService.changePassword(passwords.old_password, passwords.new_password);
      toast.success('Password changed successfully');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLoadLoginHistory = async () => {
    try {
      const data = await settingsService.getLoginHistory(20);
      setLoginHistory(data);
    } catch (err) {
      toast.error('Failed to load login history');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>General Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" value={general.company_name} onChange={e => setGeneral({ ...general, company_name: e.target.value })} placeholder="Enter company name" />
              </div>
              <div className={styles.formGroup}>
                <label>Timezone</label>
                <select value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Language</label>
                <select value={general.language} onChange={e => setGeneral({ ...general, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Currency</label>
                <select value={general.currency} onChange={e => setGeneral({ ...general, currency: e.target.value })}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Date Format</label>
                <select value={general.date_format} onChange={e => setGeneral({ ...general, date_format: e.target.value })}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Time Format</label>
                <select value={general.time_format} onChange={e => setGeneral({ ...general, time_format: e.target.value })}>
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Week Start</label>
                <select value={general.week_start} onChange={e => setGeneral({ ...general, week_start: e.target.value })}>
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            </div>
            <div className={styles.tabActions}>
              <button className={styles.saveBtn} onClick={() => handleSave('general')} disabled={saving}>
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Profile Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input type="text" value={profile.name?.split(' ')[0] || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="First name" />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input type="text" value={profile.name?.split(' ')[1] || ''} onChange={e => setProfile({ ...profile, name: (profile.name?.split(' ')[0] || '') + ' ' + e.target.value })} placeholder="Last name" />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
              </div>
              <div className={styles.formGroup}>
                <label>Designation</label>
                <input type="text" value={profile.designation} onChange={e => setProfile({ ...profile, designation: e.target.value })} placeholder="Designation" />
              </div>
              <div className={styles.formGroupFull}>
                <label>Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself" rows={3} />
              </div>
            </div>
            <div className={styles.tabActions}>
              <button className={styles.saveBtn} onClick={() => handleSave('profile')} disabled={saving}>
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Account Settings</h3>
            <div className={styles.accountCard}>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Username</span>
                <span className={styles.accountValue}>{account.username}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Email</span>
                <span className={styles.accountValue}>{account.email}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Status</span>
                <span className={`${styles.accountBadge} ${styles[account.status.toLowerCase()]}`}>{account.status}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Created</span>
                <span className={styles.accountValue}>{account.created_at ? new Date(account.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className={styles.dangerZone}>
              <h4>Danger Zone</h4>
              <button className={styles.dangerBtn} onClick={async () => {
                if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  await settingsService.deleteAccount();
                  toast.success('Account deleted');
                }
              }}>Delete Account</button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Security Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Two-Factor Authentication</label>
                <select value={security.two_factor_enabled ? 'enabled' : 'disabled'} onChange={e => setSecurity({ ...security, two_factor_enabled: e.target.value === 'enabled' })}>
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Session Timeout (minutes)</label>
                <input type="number" value={security.session_timeout_minutes} onChange={e => setSecurity({ ...security, session_timeout_minutes: parseInt(e.target.value) || 60 })} />
              </div>
            </div>
            <div className={styles.tabActions}>
              <button className={styles.saveBtn} onClick={() => handleSave('security')} disabled={saving}>
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>

            <h4 className={styles.subSectionTitle}>Change Password</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Old Password</label>
                <input type="password" value={passwords.old_password} onChange={e => setPasswords({ ...passwords, old_password: e.target.value })} placeholder="Old password" />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="New password" />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} placeholder="Confirm password" />
              </div>
            </div>
            <div className={styles.tabActions}>
              <button className={styles.primaryBtn} onClick={handleChangePassword}>Change Password</button>
            </div>

            <h4 className={styles.subSectionTitle}>Login History</h4>
            <button className={styles.secondaryBtn} onClick={handleLoadLoginHistory}>Load Login History</button>
            {loginHistory.length > 0 && (
              <div className={styles.historyList}>
                {loginHistory.map(entry => (
                  <div key={entry.id} className={styles.historyItem}>
                    <div className={styles.historyDot} />
                    <div>
                      <div>{entry.ip_address} · {entry.browser} · {entry.os}</div>
                      <div className={styles.historyTime}>{new Date(entry.login_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'appearance':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Theme</label>
                <select value={appearance.theme} onChange={e => setAppearance({ ...appearance, theme: e.target.value })}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Accent Color</label>
                <input type="color" value={appearance.accent_color} onChange={e => setAppearance({ ...appearance, accent_color: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Sidebar Style</label>
                <select value={appearance.sidebar_style} onChange={e => setAppearance({ ...appearance, sidebar_style: e.target.value })}>
                  <option value="expanded">Expanded</option>
                  <option value="collapsed">Collapsed</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Font Size</label>
                <select value={appearance.font_size} onChange={e => setAppearance({ ...appearance, font_size: e.target.value })}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Compact Mode</label>
                <input type="checkbox" checked={appearance.compact_mode} onChange={e => setAppearance({ ...appearance, compact_mode: e.target.checked })} />
              </div>
              <div className={styles.formGroup}>
                <label>Animations</label>
                <input type="checkbox" checked={appearance.animations_enabled} onChange={e => setAppearance({ ...appearance, animations_enabled: e.target.checked })} />
              </div>
            </div>
            <div className={styles.tabActions}>
              <button className={styles.saveBtn} onClick={() => handleSave('appearance')} disabled={saving}>
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Notification Preferences</h3>
            <div className={styles.formGrid}>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className={styles.toggleRow}>
                  <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                  <input type="checkbox" checked={value} onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })} />
                </div>
              ))}
            </div>
            <div className={styles.tabActions}>
              <button className={styles.saveBtn} onClick={() => handleSave('notifications')} disabled={saving}>
                <LuSave size={16} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        );

      case 'roles':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>Roles & Permissions</h3>
            <div className={styles.rolesGrid}>
              {roles.map(role => (
                <div key={role.id} className={styles.roleCard}>
                  <div className={styles.roleHeader}>
                    <h4>{role.name}</h4>
                    <span className={styles.roleBadge}>{role.permissions?.length || 0} permissions</span>
                  </div>
                  <p className={styles.roleDesc}>{role.description}</p>
                  <div className={styles.permList}>
                    {role.permissions?.map(perm => (
                      <span key={perm.id} className={styles.permChip}>{perm.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'system':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>System Information</h3>
            {systemInfo && (
              <div className={styles.systemGrid}>
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div key={key} className={styles.systemItem}>
                    <span className={styles.systemLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className={styles.systemValue}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'about':
        return (
          <div className={styles.tabContent}>
            <h3 className={styles.sectionTitle}>About ProjectPilot</h3>
            <div className={styles.aboutCard}>
              <div className={styles.aboutIcon}>🚀</div>
              <h2>ProjectPilot</h2>
              <p>Enterprise Project Management System</p>
              <div className={styles.aboutMeta}>
                <div><strong>Version:</strong> 1.0.0</div>
                <div><strong>Developer:</strong> ProjectPilot Team</div>
                <div><strong>License:</strong> MIT</div>
                <div><strong>Build:</strong> 2026.01</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout pageTitle="Settings">
      <div className={styles.page}>
        <div className={styles.layout}>
          {/* ── Left Tabs ── */}
          <div className={styles.tabsNav}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Content ── */}
          <div className={styles.tabPanel}>
            {loading ? (
              <div className={styles.loader}>Loading settings...</div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;