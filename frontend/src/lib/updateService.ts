export const CURRENT_APP_VERSION = '1.0.0'
export const GITHUB_REPO = 'englutandula/Luta-studio-window-'

export interface ReleaseAsset {
  name: string
  downloadUrl: string
  size: number
  platform: 'mac' | 'windows' | 'linux' | 'other'
}

export interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseName: string
  releaseNotes: string
  publishedAt: string
  htmlUrl: string
  downloadUrl: string
  assets: ReleaseAsset[]
}

/**
 * Compare two semver strings (e.g. "1.1.0" vs "1.0.0").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/i, '').trim()
  const clean2 = v2.replace(/^v/i, '').trim()

  const parts1 = clean1.split(/[.-]/).map((n) => parseInt(n, 10) || 0)
  const parts2 = clean2.split(/[.-]/).map((n) => parseInt(n, 10) || 0)

  const maxLength = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }

  return 0
}

function detectPlatform(fileName: string): 'mac' | 'windows' | 'linux' | 'other' {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.dmg') || lower.endsWith('.pkg') || lower.includes('mac')) return 'mac'
  if (lower.endsWith('.exe') || lower.endsWith('.msi') || lower.includes('win')) return 'windows'
  if (lower.endsWith('.appimage') || lower.endsWith('.deb') || lower.endsWith('.rpm') || lower.includes('linux')) return 'linux'
  return 'other'
}

const CACHE_KEY = 'luta_update_check_cache'
const CACHE_DURATION_MS = 1000 * 60 * 60 // 1 hour

/**
 * Check GitHub Releases for updates.
 * Safely fails over without blocking app startup.
 */
export async function checkForAppUpdates(force = false): Promise<UpdateInfo> {
  const defaultNoUpdate: UpdateInfo = {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    releaseName: '',
    releaseNotes: '',
    publishedAt: '',
    htmlUrl: `https://github.com/${GITHUB_REPO}/releases`,
    downloadUrl: `https://github.com/${GITHUB_REPO}/releases/latest`,
    assets: [],
  }

  // Check cached result to avoid GitHub API rate-limiting unless force is true
  if (!force && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { timestamp, data } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          return data
        }
      }
    } catch {
      // Ignore cache errors
    }
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (response.status === 404) {
      // No published releases yet
      return defaultNoUpdate
    }

    if (!response.ok) {
      console.warn(`GitHub Releases API responded with status ${response.status}`)
      return defaultNoUpdate
    }

    const release = await response.json()
    const remoteVersionTag = (release.tag_name || release.name || '').replace(/^v/i, '')

    const hasNewer = compareSemver(remoteVersionTag, CURRENT_APP_VERSION) > 0

    const assets: ReleaseAsset[] = Array.isArray(release.assets)
      ? release.assets.map((asset: { name: string; browser_download_url: string; size: number }) => ({
          name: asset.name,
          downloadUrl: asset.browser_download_url,
          size: asset.size,
          platform: detectPlatform(asset.name),
        }))
      : []

    // Find direct download for user's platform if available
    let primaryDownloadUrl = release.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`
    if (typeof window !== 'undefined') {
      const isMac = navigator.userAgent.includes('Macintosh')
      const isWin = navigator.userAgent.includes('Windows')
      const targetPlatform = isMac ? 'mac' : isWin ? 'windows' : 'linux'
      const matchedAsset = assets.find((a) => a.platform === targetPlatform)
      if (matchedAsset) {
        primaryDownloadUrl = matchedAsset.downloadUrl
      }
    }

    const updateInfo: UpdateInfo = {
      hasUpdate: hasNewer,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: remoteVersionTag || CURRENT_APP_VERSION,
      releaseName: release.name || `Version ${remoteVersionTag}`,
      releaseNotes: release.body || 'Performance enhancements and bug fixes.',
      publishedAt: release.published_at || '',
      htmlUrl: release.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      downloadUrl: primaryDownloadUrl,
      assets,
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: updateInfo,
          })
        )
      } catch {
        // Storage full or disabled
      }
    }

    return updateInfo
  } catch (err) {
    console.warn('Update check failed:', err)
    return defaultNoUpdate
  }
}

/**
 * Placeholder for future subscription / license entitlement check.
 * When payment is introduced, this connects to your payment/license API.
 */
export async function checkSubscriptionEntitlement(): Promise<{ isSubscribed: boolean; plan: string }> {
  // Free / default plan for now
  return {
    isSubscribed: true,
    plan: 'free',
  }
}
