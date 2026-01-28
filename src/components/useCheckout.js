// src/components/useCheckout.js
import { useState } from "react";

export default function useCheckout({
  API_URL,
  cart,
  selectedCustomer,
  grossTotal,
  fetchRewardsByMobile,
  setSelectedCustomer,
  setCart,
  setInvoiceData,
  setShowInvoice,
  setShowSuccessToast,
  setFreeApplyEnabled,
  setOfferTouched,
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }
    if (cart.length === 0) {
      alert("Add items to cart before checkout");
      return;
    }

    setLoading(true);

    try {
      const invoiceItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const res = await fetch(`${API_URL}/api/transactions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMobile: selectedCustomer.mobile,
          applyOffer: true,
          items: invoiceItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transaction failed");

      const itemsRes = await fetch(
        `${API_URL}/api/transactions/items/${data.transactionId}`
      );
      const savedItems = await itemsRes.json();

      setInvoiceData({
        billNo: data.transactionId,
        date: new Date().toLocaleString(),
        customer: {
          name: selectedCustomer.name,
          mobile: selectedCustomer.mobile,
        },
        items: savedItems,
        subTotal: grossTotal,
        finalAmount: Number(data.totalAmount) || 0,
        offerApplied: data.offerApplied,
        xeroxSummary: data.xeroxSummary || null,
        offer: data.offer || null,
      });

      setShowInvoice(true);
      setCart([]);
      setFreeApplyEnabled(false);
      setOfferTouched(false);

      const rewards = await fetchRewardsByMobile(selectedCustomer.mobile);
      setSelectedCustomer((prev) => (prev ? { ...prev, rewards } : prev));

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading };
}
