import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRecentReceipts } from '@/lib/gmail'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { google } from 'googleapis'
import { EventEmitter } from 'events'

// Mock dependencies
vi.mock('next-auth')
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
  },
}))

// Create a robust mock for googleapis
const mockMessagesList = vi.fn().mockResolvedValue({ data: { messages: [] } })
const mockMessagesGet = vi.fn()

class MockOAuth2Client extends EventEmitter {
  setCredentials = vi.fn()
}

vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        OAuth2: vi.fn(),
      },
      gmail: vi.fn(() => ({
        users: {
          messages: {
            list: mockMessagesList,
            get: mockMessagesGet,
          },
        },
      })),
    },
  }
})

describe('fetchRecentReceipts - Token Refresh', () => {
  const mockSession = { user: { id: 'user-1' } }
  const mockAccount = {
    userId: 'user-1',
    provider: 'google',
    providerAccountId: 'google-id-123',
    access_token: 'old-access-token',
    refresh_token: 'refresh-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue(mockSession as any)
  })

  it('should update database when oauth2Client emits "tokens" event', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)

    const mockOAuth2Client = new MockOAuth2Client()
    vi.mocked(google.auth.OAuth2).mockImplementation(class {
      constructor() {
        return mockOAuth2Client
      }
    } as any)

    // Trigger the function
    await fetchRecentReceipts()

    // Simulate "tokens" event
    const newTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    }
    mockOAuth2Client.emit('tokens', newTokens)

    // Verify prisma.account.update was called
    expect(prisma.account.update).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: 'google-id-123',
        },
      },
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    })
  })

  it('should throw "needs_reauth" when Gmail API returns "invalid_grant"', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)
    
    const mockOAuth2Client = new MockOAuth2Client()
    vi.mocked(google.auth.OAuth2).mockImplementation(class {
      constructor() {
        return mockOAuth2Client
      }
    } as any)

    // Mock Gmail API to throw invalid_grant
    mockMessagesList.mockRejectedValueOnce({
      response: {
        data: {
          error: 'invalid_grant',
          error_description: 'Bad Request'
        }
      }
    })

    await expect(fetchRecentReceipts()).rejects.toThrow('needs_reauth')
  })
})
