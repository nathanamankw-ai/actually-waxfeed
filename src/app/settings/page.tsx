"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DefaultAvatar } from "@/components/default-avatar"
import { RoleBadge, type AccountType } from "@/components/role-badge"

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [originalUsername, setOriginalUsername] = useState("")
  const [usernameChangesUsed, setUsernameChangesUsed] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [bio, setBio] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    twitter: "",
    spotify: "",
    website: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Account type & verification
  const [accountType, setAccountType] = useState<AccountType>("user")
  const [isVerified, setIsVerified] = useState(false)
  const [accountTypeVerifiedAt, setAccountTypeVerifiedAt] = useState<string | null>(null)
  const [displayBadge, setDisplayBadge] = useState(true)
  const [pendingRequest, setPendingRequest] = useState<{type: string; status: string} | null>(null)
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [verificationReason, setVerificationReason] = useState("")
  const [verificationProofUrl, setVerificationProofUrl] = useState("")
  const [requestedAccountType, setRequestedAccountType] = useState<AccountType>("artist")
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.username) return
      try {
        const res = await fetch(`/api/users/${session.user.username}`)
        const data = await res.json()
        if (data.success) {
          setUsername(data.data.username || "")
          setOriginalUsername(data.data.username || "")
          setUsernameChangesUsed(data.data.usernameChangesUsed || 0)
          setIsPremium(data.data.isPremium || false)
          setBio(data.data.bio || "")
          setImage(data.data.image || null)
          setSocialLinks(data.data.socialLinks || {
            instagram: "",
            twitter: "",
            spotify: "",
            website: "",
          })
          // Account type data
          setAccountType(data.data.accountType || "user")
          setIsVerified(data.data.isVerified || false)
          setAccountTypeVerifiedAt(data.data.accountTypeVerifiedAt || null)
          setDisplayBadge(data.data.displayBadge !== false)
        }
        
        // Fetch pending verification requests
        const requestRes = await fetch("/api/verification-requests")
        const requestData = await requestRes.json()
        if (requestData.pendingRequest) {
          setPendingRequest(requestData.pendingRequest)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }
    fetchProfile()
  }, [session?.user?.username])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage("")
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        setImage(data.url)
        setMessage("Profile picture updated!")
        update()
      } else {
        setMessage(data.error || "Upload failed")
      }
    } catch {
      setMessage("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const payload: Record<string, unknown> = {
        bio,
        socialLinks,
        displayBadge,
      }

      // Only include username if it changed
      if (username !== originalUsername) {
        payload.username = username
      }

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("Settings saved!")
        setOriginalUsername(username)
        if (data.data?.usernameChangesUsed !== undefined) {
          setUsernameChangesUsed(data.data.usernameChangesUsed)
        }
        await update()
        router.refresh()
      } else {
        setMessage(data.error || "Failed to save")
      }
    } catch {
      setMessage("Something went wrong")
    }

    setLoading(false)
  }

  const canChangeUsername = usernameChangesUsed === 0 || isPremium
  const usernameChanged = username !== originalUsername

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-[#888]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold tracking-tighter mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Profile</h2>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <label className="relative w-24 h-24 cursor-pointer group">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover border border-[#333]"
                  />
                ) : (
                  <DefaultAvatar size="lg" className="w-full h-full" />
                )}
                {/* Hover overlay with plus icon */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <div className="text-sm text-[#888]">
                <p>Click to upload</p>
                <p className="text-xs text-[#666]">Max 4MB • JPEG, PNG, GIF, WebP</p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Username</label>
            <div className="flex items-center gap-2">
              <span className="text-[#666]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="username"
                maxLength={30}
                className="flex-1 bg-[#111] border border-[#333] px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            {usernameChanged && !canChangeUsername && (
              <p className="text-xs text-red-500 mt-1">
                Username change requires payment ($5) or premium subscription
              </p>
            )}
            {usernameChanged && canChangeUsername && usernameChangesUsed === 0 && (
              <p className="text-xs text-green-500 mt-1">
                First username change is free!
              </p>
            )}
            {!usernameChanged && (
              <p className="text-xs text-[#666] mt-1">
                {usernameChangesUsed === 0
                  ? "First username change is free"
                  : isPremium
                    ? "Premium members can change username anytime"
                    : "Username changes cost $5"}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full"
            />
            <p className="text-xs text-[#666] mt-1">{bio.length}/150</p>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Social Links</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[#888] w-20">Instagram</span>
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="@username or URL"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#888] w-20">Twitter</span>
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="@username or URL"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#888] w-20">Spotify</span>
                <input
                  type="text"
                  value={socialLinks.spotify}
                  onChange={(e) => setSocialLinks({ ...socialLinks, spotify: e.target.value })}
                  placeholder="Spotify profile URL"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#888] w-20">Website</span>
                <input
                  type="text"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Type & Verification Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Account Type & Verification</h2>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-[#111] border border-[#333] p-4 rounded">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[#888]">Current Status:</span>
              <RoleBadge 
                accountType={accountType} 
                isVerified={!!accountTypeVerifiedAt}
                showLabel={true}
                size="md"
              />
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-blue-500 text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            
            {accountTypeVerifiedAt && (
              <p className="text-xs text-[#666]">
                Account type verified on {new Date(accountTypeVerifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Display Badge Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm text-white">Show Role Badge</label>
              <p className="text-xs text-[#666]">Display your account type badge on your profile</p>
            </div>
            <button
              onClick={() => setDisplayBadge(!displayBadge)}
              className={`w-12 h-6 rounded-full transition-colors ${displayBadge ? 'bg-blue-600' : 'bg-[#333]'}`}
            >
              <span 
                className={`block w-5 h-5 bg-white rounded-full transition-transform ${displayBadge ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {/* Pending Request */}
          {pendingRequest && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded">
              <p className="text-yellow-500 text-sm">
                ⏳ You have a pending {pendingRequest.type === "verification" ? "verification" : "account type"} request
              </p>
            </div>
          )}

          {/* Request Verification / Account Type Change */}
          {!pendingRequest && !showVerificationForm && (
            <div className="space-y-3">
              {!isVerified && (
                <button
                  onClick={() => {
                    setShowVerificationForm(true)
                    setRequestedAccountType(accountType === "user" ? "artist" : accountType)
                  }}
                  className="w-full bg-[#222] hover:bg-[#333] border border-[#444] px-4 py-3 text-left transition-colors rounded"
                >
                  <span className="font-medium">Request Verification</span>
                  <p className="text-xs text-[#888] mt-1">
                    Get verified to show a checkmark on your profile
                  </p>
                </button>
              )}
              
              {accountType === "user" && (
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="w-full bg-[#222] hover:bg-[#333] border border-[#444] px-4 py-3 text-left transition-colors rounded"
                >
                  <span className="font-medium">Request Account Type Change</span>
                  <p className="text-xs text-[#888] mt-1">
                    Apply for Artist, Organization, Editor, or DJ status
                  </p>
                </button>
              )}
            </div>
          )}

          {/* Verification Form */}
          {showVerificationForm && (
            <div className="bg-[#111] border border-[#333] p-4 rounded space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Request Form</h3>
                <button 
                  onClick={() => setShowVerificationForm(false)}
                  className="text-[#888] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm text-[#888] mb-2">Account Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["artist", "org", "editor", "dj"] as AccountType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRequestedAccountType(type)}
                      className={`p-3 border rounded text-center transition-colors ${
                        requestedAccountType === type
                          ? "border-white bg-[#222]"
                          : "border-[#333] hover:border-[#555]"
                      }`}
                    >
                      <RoleBadge accountType={type} showLabel={false} size="lg" />
                      <p className="text-xs mt-1 capitalize">{type === "org" ? "Organization" : type}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm text-[#888] mb-2">
                  Why should you be verified as {requestedAccountType === "org" ? "an Organization" : `a ${requestedAccountType.charAt(0).toUpperCase() + requestedAccountType.slice(1)}`}?
                </label>
                <textarea
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Explain your role, credentials, or why you should have this account type..."
                  className="w-full bg-[#0a0a0a] border border-[#333] px-3 py-2 text-white focus:outline-none focus:border-white transition-colors rounded"
                />
                <p className="text-xs text-[#666] mt-1">{verificationReason.length}/1000</p>
              </div>

              {/* Proof URL */}
              <div>
                <label className="block text-sm text-[#888] mb-2">Proof Link (optional)</label>
                <input
                  type="url"
                  value={verificationProofUrl}
                  onChange={(e) => setVerificationProofUrl(e.target.value)}
                  placeholder="https://spotify.com/artist/... or https://yourwebsite.com"
                  className="w-full bg-[#0a0a0a] border border-[#333] px-3 py-2 text-white focus:outline-none focus:border-white transition-colors rounded"
                />
                <p className="text-xs text-[#666] mt-1">
                  Link to your Spotify artist page, organization website, portfolio, etc.
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={async () => {
                  if (!verificationReason.trim()) {
                    setMessage("Please provide a reason for your request")
                    return
                  }
                  setVerificationLoading(true)
                  try {
                    const res = await fetch("/api/verification-requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        requestType: isVerified ? "account_type" : "verification",
                        requestedType: requestedAccountType,
                        reason: verificationReason,
                        proofUrl: verificationProofUrl || null,
                      }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setMessage("Request submitted successfully!")
                      setPendingRequest({ type: "verification", status: "pending" })
                      setShowVerificationForm(false)
                      setVerificationReason("")
                      setVerificationProofUrl("")
                    } else {
                      setMessage(data.error || "Failed to submit request")
                    }
                  } catch {
                    setMessage("Something went wrong")
                  }
                  setVerificationLoading(false)
                }}
                disabled={verificationLoading || !verificationReason.trim()}
                className="w-full bg-white text-black px-4 py-3 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {verificationLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading || (usernameChanged && !canChangeUsername)}
          className="bg-white text-black px-6 py-3 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {message && (
          <p className={message.includes("saved") || message.includes("updated") || message.includes("success") ? "text-green-500" : "text-red-500"}>
            {message}
          </p>
        )}
      </div>

      {/* Danger Zone */}
      <section className="mt-16 pt-8 border-t border-[#222]">
        <h2 className="text-xl font-bold mb-6 text-red-500">Danger Zone</h2>
        <p className="text-sm text-[#888] mb-4">
          Contact scrolling@waxfeed.com to delete your account.
        </p>
      </section>
    </div>
  )
}
