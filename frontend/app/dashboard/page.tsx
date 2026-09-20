'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Trash2,
  ArrowRight,
  Sparkles,
  Clock,
  Settings,
  User as UserIcon,
  Mail,
  Calendar,
  TrendingUp,
  LogOut,
  Check,
  ShieldCheck,
  Zap,
  Save,
  Crown,
  CreditCard,
  BarChart3,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getHistory, deleteHistoryItem, clearHistory } from '@/lib/api';
import { tools, getLiveTools } from '@/lib/tools';
import { ToolIcon } from '@/components/ToolIcon';

interface ToolRecord {
  id: string | number;
  tool_type: string;
  tool_name?: string;
  category?: string;
  created_at: string;
  result_url?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setDisplayName(user.name || user.email?.split('@')[0] || 'User');
    }
  }, [user, authLoading, router]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingHistory(true);
      const data = await getHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    setDisplayName(newName.trim());
    setEditingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
    setSavingName(false);
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteRecord = async (id: string | number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    await deleteHistoryItem(id);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      await clearHistory();
    }
  };

  if (authLoading || !user) {
    return (
      <div className="lt-container flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
      </div>
    );
  }

  const liveTools = getLiveTools();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Statistics
  const totalUses = history.length;
  const uniqueTools = new Set(history.map((r) => r.tool_type)).size;
  const lastUsed = history[0]?.created_at;
  const totalAvailable = tools.length;

  // Tool breakdown
  const toolUsageMap = new Map<string, number>();
  history.forEach((r) => {
    const slug = r.tool_type || 'passport-photo-maker';
    toolUsageMap.set(slug, (toolUsageMap.get(slug) ?? 0) + 1);
  });
  const toolBreakdown = Array.from(toolUsageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'history' as const, label: 'Activity', icon: History },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lt-container py-8">
      {/* Header */}
      <div className="lt-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border lt-border-color lt-surface px-3 py-1 text-xs font-medium lt-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" /> Dashboard
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
              Welcome, {displayName}
            </h1>
            <p className="mt-1 text-sm lt-text-muted">{user.email}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--lt-primary)/0.1)] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--lt-primary))]">
            <Crown className="h-4 w-4" /> Free Plan
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-1 border-b lt-border-color lt-fade-up">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'border-[rgb(var(--lt-primary))] text-[rgb(var(--lt-primary))] font-semibold'
                : 'border-transparent lt-text-muted hover:text-[rgb(var(--lt-text))]'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8 lt-fade-in">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            <div className="lt-card p-3.5 sm:p-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-extrabold text-[rgb(var(--lt-text))]">{totalUses}</div>
              <div className="mt-0.5 text-[11px] sm:text-xs lt-text-muted">Total tools used</div>
            </div>
            <div className="lt-card p-3.5 sm:p-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-accent)/0.1)] text-[rgb(var(--lt-accent))]">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-extrabold text-[rgb(var(--lt-text))]">{uniqueTools}</div>
              <div className="mt-0.5 text-[11px] sm:text-xs lt-text-muted">Unique tools tried</div>
            </div>
            <div className="lt-card p-3.5 sm:p-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-warning)/0.1)] text-[rgb(var(--lt-warning))]">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-bold text-[rgb(var(--lt-text))] truncate">
                {lastUsed ? new Date(lastUsed).toLocaleDateString() : '—'}
              </div>
              <div className="mt-0.5 text-[11px] sm:text-xs lt-text-muted">Last activity</div>
            </div>
            <div className="lt-card p-3.5 sm:p-5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-success)/0.1)] text-[rgb(var(--lt-success))]">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="mt-2.5 sm:mt-3 text-xl sm:text-2xl font-extrabold text-[rgb(var(--lt-text))]">{totalAvailable}</div>
              <div className="mt-0.5 text-[11px] sm:text-xs lt-text-muted">Tools on platform</div>
            </div>
          </div>

          {/* Quick access + Plan */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Quick access */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
                <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Quick access</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {liveTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.href || `/tools/${tool.slug}`}
                    className="lt-card lt-card-hover group flex items-center gap-4 p-5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                      <ToolIcon name={tool.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[rgb(var(--lt-text))]">{tool.name}</h3>
                      <p className="truncate text-xs lt-text-muted">{tool.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Current plan */}
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
                <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Your plan</h2>
              </div>
              <div className="mt-4 lt-card lt-card-elevated p-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--lt-primary)/0.1)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--lt-primary))]">
                  <Crown className="h-3.5 w-3.5" /> Free Plan
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))]" />
                    <span className="lt-text-muted">Access to all live tools</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))]" />
                    <span className="lt-text-muted">Up to 10 uses per day</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))]" />
                    <span className="lt-text-muted">Standard export quality</span>
                  </div>
                </div>
                <Link href="/pricing/" className="lt-btn-primary mt-5 w-full">
                  <Crown className="h-4 w-4" /> Upgrade plan
                </Link>
                <Link href="/pricing/" className="lt-btn-secondary mt-2 w-full">
                  Compare plans
                </Link>
              </div>
            </div>
          </div>

          {/* Tool usage breakdown */}
          {toolBreakdown.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
                <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Most used tools</h2>
              </div>
              <div className="mt-4 lt-card p-6">
                <div className="space-y-4">
                  {toolBreakdown.map(([slug, count]) => {
                    const tool = tools.find((t) => t.slug === slug || t.href === `/tools/${slug}`);
                    const maxCount = toolBreakdown[0][1];
                    const pct = Math.round((count / Math.max(maxCount, 1)) * 100);
                    return (
                      <div key={slug} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                          <ToolIcon
                            name={slug.includes('passport') ? 'Camera' : slug.includes('bg') || slug.includes('remove') ? 'Scissors' : 'Sparkles'}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[rgb(var(--lt-text))]">{tool?.name ?? slug}</span>
                            <span className="text-xs lt-text-muted">{count} {count === 1 ? 'use' : 'uses'}</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[rgb(var(--lt-surface-2))]">
                            <div
                              className="h-full rounded-full bg-[rgb(var(--lt-primary))]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Activity / History Tab ── */}
      {activeTab === 'history' && (
        <div className="mt-8 lt-fade-in">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Recent activity</h2>
          </div>

          {loadingHistory ? (
            <div className="mt-6 flex items-center justify-center py-12">
              <span className="h-6 w-6 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="mt-6 lt-card p-10 text-center">
              <Clock className="mx-auto h-10 w-10 text-[rgb(var(--lt-text-muted))]" />
              <p className="mt-3 text-sm font-medium text-[rgb(var(--lt-text))]">No activity yet</p>
              <p className="mt-1 text-xs lt-text-muted">Use a tool and your history will appear here.</p>
              <Link href="/products/" className="lt-btn-primary mt-5">
                Browse tools <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 lt-card overflow-hidden">
              <div className="divide-y lt-border-color">
                {history.map((record) => {
                  const toolHref = record.tool_type.includes('passport') ? '/tools/passport/' : '/tools/remove-bg/';
                  return (
                    <div key={record.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-[rgb(var(--lt-surface-2))]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                        <ToolIcon
                          name={record.tool_type.includes('passport') ? 'Camera' : 'Scissors'}
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={toolHref} className="text-sm font-semibold text-[rgb(var(--lt-text))] hover:text-[rgb(var(--lt-primary))]">
                          {record.tool_name || record.tool_type.replace('-', ' ').toUpperCase()}
                        </Link>
                        <p className="text-xs lt-text-muted">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-error)/0.08)] hover:text-[rgb(var(--lt-error))] cursor-pointer"
                        aria-label="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
        <div className="mt-8 space-y-6 lt-fade-in">
          {/* Profile info */}
          <div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
              <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Profile information</h2>
            </div>
            <div className="mt-4 lt-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-2xl font-bold text-white">
                  {displayName[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="lt-input py-1.5 text-sm max-w-xs"
                        placeholder="Your name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="rounded-lg bg-[rgb(var(--lt-primary))] p-2 text-white transition-opacity hover:opacity-90 cursor-pointer"
                        aria-label="Save name"
                      >
                        {savingName ? (
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[rgb(var(--lt-text))]">{displayName}</h3>
                      <button
                        onClick={() => { setNewName(displayName); setEditingName(true); }}
                        className="rounded-lg p-1 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
                        aria-label="Edit name"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {nameSaved && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[rgb(var(--lt-success))]">
                      <Check className="h-3 w-3" /> Name updated
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium lt-text-muted">Display name</label>
                  <div className="flex items-center gap-2.5 rounded-xl border lt-border-color lt-surface px-4 py-2.5 text-sm text-[rgb(var(--lt-text))]">
                    <UserIcon className="h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <span>{displayName}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium lt-text-muted">Email address</label>
                  <div className="flex items-center gap-2.5 rounded-xl border lt-border-color lt-surface px-4 py-2.5 text-sm text-[rgb(var(--lt-text))]">
                    <Mail className="h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium lt-text-muted">Member since</label>
                  <div className="flex items-center gap-2.5 rounded-xl border lt-border-color lt-surface px-4 py-2.5 text-sm text-[rgb(var(--lt-text))]">
                    <Calendar className="h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <span>{memberSince}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium lt-text-muted">Account status</label>
                  <div className="flex items-center gap-2.5 rounded-xl border lt-border-color lt-surface px-4 py-2.5 text-sm text-[rgb(var(--lt-text))]">
                    <ShieldCheck className="h-4 w-4 text-[rgb(var(--lt-success))]" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[rgb(var(--lt-primary))]" />
              <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Subscription</h2>
            </div>
            <div className="mt-4 lt-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[rgb(var(--lt-text))]">Free Plan</h3>
                    <p className="text-xs lt-text-muted">
                      No active subscription · 10 uses per day
                    </p>
                  </div>
                </div>
                <Link href="/pricing/" className="lt-btn-primary">
                  Upgrade <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Session */}
          <div>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-[rgb(var(--lt-error))]" />
              <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Session</h2>
            </div>
            <div className="mt-4 lt-card p-6">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgb(var(--lt-error)/0.2)] px-5 py-2.5 text-sm font-medium text-[rgb(var(--lt-error))] transition-colors hover:bg-[rgb(var(--lt-error)/0.08)] cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign out of your account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
