// src/utils/tokenBlacklist.util.ts

/**
 * Simple in-memory token blacklist
 * In production, consider using Redis for persistence and scalability
 */
class TokenBlacklist {
  private blacklist: Set<string> = new Set();
  private expiryMap: Map<string, number> = new Map();

  /**
   * Add token to blacklist with expiration time
   */
  addToBlacklist(token: string, expiresAt: number): void {
    this.blacklist.add(token);
    this.expiryMap.set(token, expiresAt);
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    if (!this.blacklist.has(token)) {
      return false;
    }

    // Check if token has expired
    const expiresAt = this.expiryMap.get(token);
    if (expiresAt && expiresAt < Date.now() / 1000) {
      // Remove expired token from blacklist
      this.blacklist.delete(token);
      this.expiryMap.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Remove token from blacklist (for testing/cleanup)
   */
  removeFromBlacklist(token: string): void {
    this.blacklist.delete(token);
    this.expiryMap.delete(token);
  }

  /**
   * Clear all tokens from blacklist
   */
  clearBlacklist(): void {
    this.blacklist.clear();
    this.expiryMap.clear();
  }

  /**
   * Get blacklist size (for monitoring)
   */
  getSize(): number {
    return this.blacklist.size;
  }
}

export const tokenBlacklist = new TokenBlacklist();
