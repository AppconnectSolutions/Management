// src/components/Services.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Globe,
  Search,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserPlus,
  X,
  ChevronRight,
} from "lucide-react";
import Invoice from "./Invoice";
import useCheckout from "./useCheckout";


export default function Services() {
  // ================= PRODUCTS =================

  const [roles, setRoles] = useState([]);
const [quickAddRoleId, setQuickAddRoleId] = useState("");

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
// ================= CONFIRM DIALOG =================
const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // ================= CART =================
  const [cart, setCart] = useState([]);

  // ================= CUSTOMERS =================
  const [customers, setCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // ================= QUICK ADD =================
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddMobile, setQuickAddMobile] = useState("");

  // ================= INVOICE + TOASTS =================
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [infoToast, setInfoToast] = useState(null);

  // ================= FREE APPLY =================
  const [freeApplyEnabled, setFreeApplyEnabled] = useState(false);
  const [offerTouched, setOfferTouched] = useState(false);

  // ================= REFS =================
  const dropdownRef = useRef(null);

  // ================= HELPERS =================
  const isXeroxName = (name) => (name || "").toLowerCase().includes("xerox");

  // Rewards from backend
  const xeroxReward = selectedCustomer?.rewards?.xerox || {};

  // New fields from backend
  const offerProductId = xeroxReward.offer_product_id ?? null;

  const availableFreePages = Number(xeroxReward.free_remaining || 0);
  const buyQty = Number(xeroxReward.buy_quantity || 0);
  const freeQty = Number(xeroxReward.free_quantity || 0);
  const cycleProgress = Number(xeroxReward.cycle_progress || 0);
  const cycleCount = Number(xeroxReward.cycle_count || 0);
  const totalTaken = Number(xeroxReward.totalPrinted || 0);
const totalPages = useMemo(() => {
  return cart.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
}, [cart]);

  const isEligibleXeroxItem = (item) => {
    if (!item) return false;
    if (offerProductId) return Number(item.id) === Number(offerProductId);
    return isXeroxName(item.name);
  };

  // ================= CART TOTALS =================
  const grossTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [cart]);

  /**
   * Frontend preview simulator (same as backend)
   * This is required to show discount EVEN WHEN wallet is 0,
   * but this bill will unlock free pages and consume immediately.
   */
  function simulateCycleLoyalty({ qty, buyQty, freeQty, applyOffer, progressPaid, freeBalance }) {
    let remainingNeed = Math.max(Math.floor(Number(qty) || 0), 0);

    let paid = 0;
    let freeUsed = 0;
    let earned = 0;

    let progress = Math.max(Math.floor(Number(progressPaid) || 0), 0);
    let freeBal = Math.max(Math.floor(Number(freeBalance) || 0), 0);

    if (applyOffer && freeBal > 0 && remainingNeed > 0) {
      const use = Math.min(remainingNeed, freeBal);
      freeUsed += use;
      freeBal -= use;
      remainingNeed -= use;
    }

    while (remainingNeed > 0) {
      const toCycleEnd = buyQty - progress;
      const payNow = Math.min(remainingNeed, toCycleEnd);

      paid += payNow;
      progress += payNow;
      remainingNeed -= payNow;

      if (progress === buyQty) {
        earned += freeQty;
        freeBal += freeQty;
        progress = 0;

        if (applyOffer && freeBal > 0 && remainingNeed > 0) {
          const use = Math.min(remainingNeed, freeBal);
          freeUsed += use;
          freeBal -= use;
          remainingNeed -= use;
        }
      }
    }

    return { paid, freeUsed, earned, progress, freeBal };
  }

  // Preview how many free pages CAN be used in THIS BILL if applyOffer ON
  const xeroxOfferPreview = useMemo(() => {
    const result = {
      eligibleFound: false,
      totalFreeUsed: 0,
      totalEarned: 0,
      totalSavings: 0,
    };

    if (!selectedCustomerId) return result;
    if (buyQty <= 0 || freeQty <= 0) return result;

    let runningProgress = cycleProgress;
    let runningFreeBal = availableFreePages;

    for (const item of cart) {
      if (!isEligibleXeroxItem(item)) continue;

      result.eligibleFound = true;

      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;

      const sim = simulateCycleLoyalty({
        qty,
        buyQty,
        freeQty,
        applyOffer: true,
        progressPaid: runningProgress,
        freeBalance: runningFreeBal,
      });

      runningProgress = sim.progress;
      runningFreeBal = sim.freeBal;

      result.totalFreeUsed += sim.freeUsed;
      result.totalEarned += sim.earned;
      result.totalSavings += sim.freeUsed * unitPrice;
    }

    return result;
  }, [cart, selectedCustomerId, buyQty, freeQty, cycleProgress, availableFreePages, offerProductId]);

  const hasOfferInCart = xeroxOfferPreview.eligibleFound && buyQty > 0 && freeQty > 0;
  const potentialSavings = xeroxOfferPreview.totalSavings || 0;

  // ✅ Auto-enable applyOffer if this bill has instant benefit (wallet 0 case too)

  
  useEffect(() => {
    if (!selectedCustomerId) return;
    if (!hasOfferInCart) return;

    if (!offerTouched) {
      setFreeApplyEnabled(potentialSavings > 0);
    }
  }, [selectedCustomerId, hasOfferInCart, potentialSavings, offerTouched]);

  const previewDiscount = freeApplyEnabled ? potentialSavings : 0;
  const netTotalPreview = Math.max(grossTotal - previewDiscount, 0);

  // ================= FILTER CUSTOMERS =================
  useEffect(() => {
    if (!customerSearchQuery) {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(
        customers.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            (c.mobile || "").includes(customerSearchQuery)
        )
      );
    }
  }, [customerSearchQuery, customers]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
  const fetchData = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/api/products`);
      const productsData = await prodRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);

      const custRes = await fetch(`${API_URL}/api/customers`);
      const custData = await custRes.json();
      const custList = Array.isArray(custData) ? custData : (custData.customers || []);
      setCustomers(custList);
      setFilteredCustomers(custList);

      const rolesRes = await fetch(`${API_URL}/api/roles`);
      const rolesData = await rolesRes.json();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  fetchData();
}, [API_URL]);


  // Reset offer state when customer changes
  useEffect(() => {
    setFreeApplyEnabled(false);
    setOfferTouched(false);
  }, [selectedCustomerId]);

  // ================= CART HELPERS =================
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (Number(item.quantity) || 0) + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ================= REWARDS FETCH =================
  const fetchRewardsByMobile = async (mobile) => {
    const res = await fetch(`${API_URL}/api/transactions/customer/${mobile}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch rewards");
    return data.rewards || {};
  };

  // ================= CUSTOMER SELECT =================
  const handleCustomerSelect = async (customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
    setIsCustomerDropdownOpen(false);
    setFreeApplyEnabled(false);
    setOfferTouched(false);

    try {
      const rewards = await fetchRewardsByMobile(customer.mobile);
      setSelectedCustomer((prev) =>
        prev && prev.id === customer.id ? { ...prev, rewards } : prev
      );
    } catch (e) {
      console.error("Rewards fetch failed:", e);
    }
  };

  const clearCustomerSelection = () => {
    setSelectedCustomerId("");
    setSelectedCustomer(null);
    setCustomerSearchQuery("");
    setFreeApplyEnabled(false);
    setOfferTouched(false);
  };

  // ================= QUICK ADD CUSTOMER =================
  const handleQuickAdd = async () => {
    if (!quickAddMobile) {
      setInfoToast({ message: "Mobile number is required" });
      setTimeout(() => setInfoToast(null), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/customers/admin-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  name: quickAddName,
  mobile: quickAddMobile,
  roleId: quickAddRoleId ? Number(quickAddRoleId) : null,
}),


      });

      const data = await res.json();
      if (!res.ok) {
        setInfoToast({ message: data.message || "Server error" });
        setTimeout(() => setInfoToast(null), 3000);
        return;
      }

      let toastMsg = "";
      if (data.action === "created")
        toastMsg = `Customer added. Default password: ${data.defaultPassword}`;
      else if (data.action === "updated")
        toastMsg = "Mobile already exists. Customer updated.";
      else toastMsg = "Customer selected";

      setInfoToast({ message: toastMsg });
      setTimeout(() => setInfoToast(null), 3000);

      setSelectedCustomerId(data.customer.id);
      setIsCustomerDropdownOpen(false);
      setFreeApplyEnabled(false);
      setOfferTouched(false);

      try {
        const rewards = await fetchRewardsByMobile(data.customer.mobile);
        setSelectedCustomer({ ...data.customer, rewards });
      } catch {
        setSelectedCustomer(data.customer);
      }

      setQuickAddName("");
      setQuickAddMobile("");
      setShowQuickAdd(false);
      setQuickAddRoleId("");


      setCustomers((prev) => {
        const exists = prev.find((c) => c.mobile === data.customer.mobile);
        if (exists)
          return prev.map((c) =>
            c.mobile === data.customer.mobile ? data.customer : c
          );
        return [...prev, data.customer];
      });
    } catch (err) {
      console.error("Quick add error:", err);
      setInfoToast({ message: "Network error while adding customer" });
      setTimeout(() => setInfoToast(null), 3000);
    }
  };

  // ================= CHECKOUT =================
// ✅ MUST be called at top-level (not inside if, loop, etc.)
const { handleCheckout, loading } = useCheckout({
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
});



  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 p-4 lg:p-6 bg-slate-100 relative font-sans">
      {/* LEFT CATALOG */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3 font-bold text-slate-800">
            <Globe size={20} className="text-indigo-600" />
            SERVICES & ITEMS
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search (e.g. CCTV, Pan Card)"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {products
            .filter((p) =>
              (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-3 border rounded-xl cursor-pointer flex justify-between"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50">
                    <span className="text-indigo-600 font-bold">
                      {(product.name || "?")[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs">₹{product.price}</p>
                  </div>
                </div>
                <Plus size={18} />
              </div>
            ))}
        </div>
      </div>

      {/* BILL SECTION */}
      <div className="flex-1 bg-white rounded-2xl border flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
  <h2 className="font-bold flex gap-2">
    <ShoppingCart size={18} /> Current Bill
  </h2>

  <div className="text-right">
    <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
      Developed by
    </p>
    <p className="text-xs font-extrabold text-slate-700">
      AppConnect Solutions
    </p>
  </div>
</div>


        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400">Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-xl mb-3 bg-slate-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-slate-500">₹{item.price} / page</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  className="w-20 text-center font-bold border rounded-lg py-2"
  value={item.quantity ?? ""}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // keep only digits
    setCart((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, quantity: value === "" ? "" : Number(value) } : p
      )
    );
  }}
/>


                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mt-2 text-sm font-semibold">
                  <span>
                    ₹{item.price} × {Number(item.quantity) || 0}
                  </span>
                  <span>
                    ₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TOTALS + APPLY */}
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between font-bold">
            <span>Subtotal</span>
            <span>₹{grossTotal}</span>
          </div>

          {/* ✅ SHOW OFFER EVEN IF WALLET IS 0 (THIS FIXES YOUR ISSUE) */}
          {selectedCustomer && hasOfferInCart && (
            <div className="p-3 rounded-xl border bg-indigo-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-900">
                  Free wallet: {availableFreePages} pages
                </p>
                <p className="text-[11px] text-slate-700 font-semibold">
                  Offer: Buy {buyQty || 0} → Get {freeQty || 0} Free
                </p>

                {potentialSavings > 0 ? (
                  <p className="text-[11px] text-slate-700 font-semibold">
                    This bill can use <b>{xeroxOfferPreview.totalFreeUsed}</b> free pages
                    (save ₹<b>{potentialSavings}</b>)
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-semibold">
                    No free pages can be used in this bill.
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setOfferTouched(true);
                  setFreeApplyEnabled((v) => !v);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                  freeApplyEnabled
                    ? "bg-white text-red-600 border-red-200 hover:bg-red-50"
                    : "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
                }`}
              >
                {freeApplyEnabled ? "Remove" : "Apply Offer"}
              </button>
            </div>
          )}

          {freeApplyEnabled && previewDiscount > 0 && (
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>Loyalty Savings</span>
              <span>-₹{previewDiscount}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-lg">
            <span>Payable</span>
            <span>₹{netTotalPreview}</span>
          </div>
        </div>
      </div>

      {/* CUSTOMER PROFILE */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full relative">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>Customer Profile</span>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1 hover:bg-indigo-100"
              >
                <UserPlus size={12} /> Add New
              </button>
            </h3>

            {showQuickAdd && (
              <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-indigo-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-800">
                    Quick Register
                  </span>
                  <X
                    size={14}
                    className="text-slate-400 cursor-pointer"
                    onClick={() => setShowQuickAdd(false)}
                  />
                </div>

                <input
                  className="w-full text-sm p-2 rounded border mb-2"
                  placeholder="Customer Name"
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                />
                <input
                  className="w-full text-sm p-2 rounded border mb-2"
                  placeholder="Mobile Number"
                  value={quickAddMobile}
                  onChange={(e) => setQuickAddMobile(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                />
                <select
  className="w-full text-sm p-2 rounded border mb-2 bg-white"
  value={quickAddRoleId}
  onChange={(e) => setQuickAddRoleId(e.target.value)}
>
  <option value="">Select Role</option>
  {roles.map((r) => (
    <option key={r.id} value={r.id}>
      {r.role_name}
    </option>
  ))}
</select>


                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded hover:bg-indigo-700"
                >
                  Save & Select
                </button>
              </div>
            )}

            {/* SEARCH */}
            <div className="relative mb-4" ref={dropdownRef}>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <Search className="ml-3 text-slate-400" size={18} />
                <input
                  type="text"
                  className="w-full p-3 bg-transparent outline-none text-sm font-medium"
                  placeholder="Search Customer (Name / Mobile)"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setIsCustomerDropdownOpen(true);
                    if (!e.target.value) setSelectedCustomerId("");
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                />
                {selectedCustomerId && (
                  <button
                    onClick={clearCustomerSelection}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {isCustomerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border max-h-60 overflow-y-auto z-50">
                  {filteredCustomers.length ? (
                    filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleCustomerSelect(c)}
                        className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
                      >
                        <p className="text-sm font-bold">{c.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.mobile}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No customers found
                    </div>
                  )}
                </div>
              )}
            </div>

            {!selectedCustomer ? (
              <div className="text-center text-slate-400 py-12 border-2 border-dashed rounded-xl">
                Search customer to load <strong>Loyalty Wallet</strong>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl">
                  <p className="text-xs uppercase opacity-70 mb-2">
                    Selected Customer
                  </p>
                  <div className="flex justify-between items-start">
  <div>
    <p className="text-xl font-extrabold tracking-wide">
      {selectedCustomer.name}
    </p>

    {/* ROLE BADGE */}
    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">
      {selectedCustomer.role_name || "Default"}
    </span>
  </div>

  <p className="text-xl font-extrabold tracking-wider font-mono">
    {selectedCustomer.mobile}
  </p>
</div>

                </div>

                {/* XEROX LOYALTY */}
                <div className="p-3 border rounded-xl bg-white">
                  <p className="text-xs font-bold mb-2">Xerox Loyalty (A4)</p>

                  <div className="flex justify-between mb-2 text-sm">
                    <div>
                      <p className="text-2xl font-extrabold">{cycleProgress}</p>
                      <p className="text-xs text-slate-500">
                        Cycle (Paid) / {buyQty || 0}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold">{availableFreePages}</p>
                      <p className="text-xs text-slate-500">Free Wallet</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 font-semibold mb-2">
                    Offer: Buy {buyQty || 0} → Get {freeQty || 0} Free
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{
                        width: buyQty
                          ? `${Math.min((cycleProgress / buyQty) * 100, 100)}%`
                          : "0%",
                      }}
                    />
                  </div>

                 <div className="flex justify-between items-end mt-3">
  <div>
    <p className="text-[10px] uppercase text-slate-500 font-semibold">
      Total Taken
    </p>
    <p className="text-2xl font-extrabold text-slate-900">
      {totalTaken}
    </p>
  </div>

  <div className="text-right">
    <p className="text-[10px] uppercase text-slate-500 font-semibold">
      Cycles
    </p>
    <p className="text-lg font-bold text-slate-700">
      {cycleCount}
    </p>
  </div>
</div>


                  <p className="text-xs text-center text-slate-400 mt-2">
                    Print {xeroxReward.next_unlock_in ?? 0} more PAID pages to unlock +{freeQty || 0} FREE!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PRINT BUTTON */}
          <div className="mt-4 sticky bottom-0 lg:static bg-white pt-3">
            <div className="relative group">
              <button
                disabled={cart.length === 0}
                onClick={() => setShowConfirmDialog(true)}

                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <span className="flex flex-col items-start">
                  <span className="text-xs opacity-70 uppercase mb-1">Print Bill</span>
                  <span>₹{netTotalPreview.toLocaleString()}</span>
                </span>
                <span className="bg-white/20 p-2 rounded-lg">
                  <ChevronRight size={24} />
                </span>
              </button>
            </div>
          </div>

          {showInvoice && (
            <Invoice
              data={invoiceData}
              onClose={() => {
                setShowInvoice(false);
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 3000);
              }}
            />
          )}

          {showSuccessToast && (
            <div className="fixed top-6 right-6 z-50">
              <div className="bg-white border-l-4 border-green-500 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="bg-green-100 text-green-600 rounded-full p-2">✓</div>
                <div>
                  <p className="text-sm font-bold text-green-700">
                    Transaction Successful
                  </p>
                  <p className="text-xs text-gray-500">
                    Bill printed. Points updated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {infoToast && (
            <div className="fixed top-6 right-6 z-50">
              <div className="bg-blue-100 border-l-4 border-blue-500 shadow-xl rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="bg-blue-200 text-blue-700 rounded-full p-2">ℹ️</div>
                <div>
                  <p className="text-sm font-bold text-blue-700">
                    {infoToast.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ================= CONFIRM SAVE DIALOG ================= */}
{showConfirmDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl">
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">
        Confirm Print & Save
      </h3>

      <p className="text-sm text-slate-600 mb-4">
        Are you sure you want to save this transaction?
      </p>

      {/* ITEMS SUMMARY */}
      <div className="border rounded-xl p-3 mb-3 bg-slate-50 max-h-60 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm font-semibold mb-1"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>
              ₹{Number(item.price) * Number(item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL INFO */}
      <div className="flex justify-between font-bold mb-4">
        <span>Total Pages</span>
        <span>{totalPages}</span>
      </div>

      <div className="flex justify-between font-extrabold text-lg mb-5">
        <span>Payable</span>
        <span>₹{netTotalPreview}</span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirmDialog(false)}
          className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-bold hover:bg-slate-100"
        >
          No
        </button>

    <button
  onClick={() => {
    setShowConfirmDialog(false);
    handleCheckout();
  }}
  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700"
>
  Yes, Save
</button>


      </div>
    </div>
  </div>
)}

    </div>
  );
}