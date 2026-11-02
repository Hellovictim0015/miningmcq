// Fills Razorpay checkout with the logged-in buyer's own details, so the
// receipt goes to them. Falls back to an empty prefill (Razorpay then asks).
export const getCheckoutPrefill = async (token) => {
  try {
    const res = await fetch('/api/auth/checkauth', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return {};
    const { user } = await res.json();
    return {
      name: user?.username || '',
      email: user?.email || '',
      contact: user?.phone_number || '',
    };
  } catch {
    return {};
  }
};
