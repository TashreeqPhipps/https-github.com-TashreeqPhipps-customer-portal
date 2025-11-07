/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { getEnv } from '../utils/env';
import { validate } from '../utils/validation';
import { sanitizeInput } from '../utils/sanitize';

export default function PaymentPage() {
  const API = getEnv('REACT_APP_API', '');
  const [form, setForm] = useState({
    amount: '', currency: 'USD', provider: 'SWIFT', beneficiaryAccount: '', swiftBic: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validateAll() {
    const e = {};
    const a = validate('amount', form.amount);
    if (!a.ok) e.amount = 'Invalid amount';
    const c = validate('currency', form.currency);
    if (!c.ok) e.currency = 'Invalid currency';
    const acct = validate('accountNumber', form.beneficiaryAccount);
    if (!acct.ok) e.beneficiaryAccount = 'Invalid beneficiary account';
    const s = validate('swiftBic', form.swiftBic);
    if (!s.ok) e.swiftBic = 'Invalid SWIFT/BIC';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!validateAll()) {
      setMessage('Please fix validation errors.');
      return;
    }
    setLoading(true);

    const payload = {
      amount: sanitizeInput(form.amount),
      currency: sanitizeInput(form.currency),
      provider: sanitizeInput(form.provider),
      beneficiaryAccount: sanitizeInput(form.beneficiaryAccount),
      swiftBic: sanitizeInput(form.swiftBic)
    };

    try {
      const res = await fetch(`${API}/api/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        setMessage(j.error || 'Failed to make payment');
      } else {
        setMessage('Payment successful.');
        setForm({ amount: '', currency: 'USD', provider: 'SWIFT', beneficiaryAccount: '', swiftBic: '' });
        setErrors({});
      }
    } catch (err) {
      setMessage('Network error — try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>International Payment</h2>
      <form onSubmit={onSubmit} autoComplete="off">
        <div>
          <label>Amount</label><br />
          <input name="amount" value={form.amount} onChange={onChange} autoComplete="off" />
          {errors.amount && <div style={{ color: 'red' }}>{errors.amount}</div>}
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Currency</label><br />
          <input name="currency" value={form.currency} onChange={onChange} autoComplete="off" />
          {errors.currency && <div style={{ color: 'red' }}>{errors.currency}</div>}
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Beneficiary Account</label><br />
          <input name="beneficiaryAccount" value={form.beneficiaryAccount} onChange={onChange} autoComplete="off" />
          {errors.beneficiaryAccount && <div style={{ color: 'red' }}>{errors.beneficiaryAccount}</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Pay Now'}</button>
        </div>

        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </form>
    </div>
  );
}
