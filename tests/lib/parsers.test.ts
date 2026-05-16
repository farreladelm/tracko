import { describe, it, expect } from 'vitest'
import { parseReceipt } from '@/lib/parsers'

describe('parseReceipt - Date Parsing', () => {
  const messageId = 'test-message-id'

  it('should parse Mandiri date with Indonesian month (Mei)', () => {
    const body = `
      Nominal Transaksi Rp 50.000,00
      Tanggal 30 Mei 2026 Jam 09:28:06 WIB
      Penerima SUPERINDO Surabaya
    `
    const sender = 'noreply.livin@bankmandiri.co.id'
    const result = parseReceipt(body, sender, messageId)
    
    expect(result).not.toBeNull()
    if (result) {
      expect(result.transactionDate.getFullYear()).toBe(2026)
      expect(result.transactionDate.getMonth()).toBe(4) // May is 4 (0-indexed)
      expect(result.transactionDate.getDate()).toBe(30)
    }
  })

  it('should parse BCA BLU date with Indonesian month (Agt)', () => {
    const body = `
      Nominal Tagihan Rp 17.000,00
      Tgl & Jam Transaksi 17 Agt 2026 18:10:50 WIB
      bluSpending Warung Gunarso
    `
    const sender = 'receipts@blubybcadigital.id'
    const result = parseReceipt(body, sender, messageId)
    
    expect(result).not.toBeNull()
    if (result) {
      expect(result.transactionDate.getFullYear()).toBe(2026)
      expect(result.transactionDate.getMonth()).toBe(7) // August is 7 (0-indexed)
      expect(result.transactionDate.getDate()).toBe(17)
    }
  })

  it('should parse Mandiri date with full Indonesian month (Oktober)', () => {
    const body = `
      Nominal Transaksi Rp 10.000,00
      Tanggal 10 Oktober 2025 Jam 10:00:00 WIB
      Penerima Alfamart
    `
    const sender = 'noreply.livin@bankmandiri.co.id'
    const result = parseReceipt(body, sender, messageId)
    
    expect(result).not.toBeNull()
    if (result) {
      expect(result.transactionDate.getFullYear()).toBe(2025)
      expect(result.transactionDate.getMonth()).toBe(9) // October is 9
      expect(result.transactionDate.getDate()).toBe(10)
    }
  })
})
