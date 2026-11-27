"use client";

import { useState } from "react";
import { Plus, Trash2, X, Check, ShieldQuestion, ChevronDown } from "lucide-react";
import { SubPage } from "../SubPage";
import { CbiButton, CbiRow, HexagonIcon } from "../cbi";
import { useMbanking } from "@/lib/mbanking/store";
import { toast } from "@/lib/mbanking/toast";
import { cn } from "@/lib/utils";
import type { Beneficiary } from "@/lib/mbanking/types";
import type { TransferMethod } from "@/lib/mbanking/types";

const METHOD_BADGE: Record<TransferMethod, string> = {
  SEPA: "SEPA · EUR",
  SWIFT: "SWIFT",
  LOCAL: "LOCAL · AED",
};

/** Beneficiary management — saved payees + activation via dual authorization. */
export function BeneficiariesPage() {
  const beneficiaries = useMbanking((s) => s.beneficiaries);
  const workItems = useMbanking((s) => s.workItems);
  const addBeneficiaryRequest = useMbanking((s) => s.addBeneficiaryRequest);
  const deleteBeneficiary = useMbanking((s) => s.deleteBeneficiary);

  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [country, setCountry] = useState("United Arab Emirates");
  const [method, setMethod] = useState<TransferMethod>("LOCAL");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [deleteFor, setDeleteFor] = useState<Beneficiary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pendingActivation = workItems.find(
    (w) => w.category === "Beneficiary Activation" && w.status === "Pending Approval"
  );

  const resetAdd = () => {
    setStep(1);
    setName("");
    setIban("");
    setMethod("LOCAL");
    setOtp("");
    setDone(false);
  };

  const submit = async () => {
    setBusy(true);
    const r = await addBeneficiaryRequest({
      name: name.trim(),
      iban: iban.trim().toUpperCase(),
      country,
      method,
      note: "Added via mobile banking by authorized signatory",
    });
    setBusy(false);
    if (r.ok) {
      setDone(true);
    } else {
      toast(r.error ?? "Request failed", "error");
    }
  };

  const confirmDeleteBeneficiary = async () => {
    if (!deleteFor) return;
    setBusy(true);
    const r = await deleteBeneficiary(deleteFor.id);
    setBusy(false);
    setDeleteFor(null);
    setConfirmDelete(false);
    if (r.ok) toast("Beneficiary removed", "info");
    else toast(r.error ?? "Could not remove", "error");
  };

  return (
    <SubPage title="Beneficiaries" stepIndicator="Saved Payees">
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* Pending activation notice */}
        {pendingActivation && (
          <div className="border border-[#82134C]/40 bg-[#82134C]/[0.05] px-3 py-2.5">
            <p className="text-[12px] font-bold text-[#82134C]">
              Activation pending checker approval
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#7F7F7F]">
              {pendingActivation.counterparty} — awaiting second authorization
              ({pendingActivation.reference}).
            </p>
          </div>
        )}

        {/* Add flow (replaces the list while open) */}
        {addOpen ? (
          <div className="cbi-card overflow-hidden">
            <div className="h-[18px] w-full bg-[#82134C]" />
            <div className="px-3 pb-3 pt-2.5">
              {done ? (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#217A3B]/50 text-[#217A3B]">
                    <Check className="h-8 w-8" strokeWidth={2} />
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold text-[#000F32]">
                    Activation Request Submitted
                  </h3>
                  <p className="mt-1.5 px-2 text-[12px] leading-relaxed text-[#7F7F7F]">
                    {name.trim()} will appear in your saved payees once the request
                    is approved under the dual-authorization matrix.
                  </p>
                  <div className="mt-4">
                    <CbiButton
                      onClick={() => {
                        setAddOpen(false);
                        resetAdd();
                      }}
                    >
                      Done
                    </CbiButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-bold text-[#595959]">
                      New Beneficiary
                    </p>
                    <button onClick={() => { setAddOpen(false); resetAdd(); }} aria-label="Close">
                      <X className="h-5 w-5 text-[#7F7F7F]" />
                    </button>
                  </div>

                  {step === 1 ? (
                    <div className="mt-2 flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-[12px] text-[#7F7F7F]">
                          Beneficiary Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter company name"
                          className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 text-[13px] font-bold text-[#222222] outline-none placeholder:font-normal placeholder:text-[#BFBFBF] focus:border-[#82134C]"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] text-[#7F7F7F]">
                          IBAN / Account
                        </label>
                        <input
                          type="text"
                          value={iban}
                          onChange={(e) => setIban(e.target.value.toUpperCase())}
                          required
                          placeholder="AE47 0260 0000 2314 8850 102"
                          className="w-full border-b border-[#E8306E] bg-white pb-2 pt-1 font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-[#222222] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-[#BFBFBF] focus:border-[#82134C]"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] text-[#7F7F7F]">
                          Transfer Method
                        </label>
                        <div className="relative">
                          <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as TransferMethod)}
                            className="w-full appearance-none border border-[#D9D9D9] bg-white px-2.5 py-2.5 text-[13px] text-[#222222] outline-none"
                          >
                            <option value="LOCAL">Local (AED)</option>
                            <option value="SEPA">SEPA (EUR)</option>
                            <option value="SWIFT">SWIFT International</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7F7F7F]" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] text-[#7F7F7F]">
                          Country
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full appearance-none border border-[#D9D9D9] bg-white px-2.5 py-2.5 text-[13px] text-[#222222] outline-none"
                        >
                          <option>United Arab Emirates</option>
                          <option>Switzerland</option>
                          <option>Singapore</option>
                          <option>United Kingdom</option>
                          <option>Germany</option>
                          <option>United States</option>
                        </select>
                      </div>
                      <CbiButton onClick={() => setStep(2)}>Next</CbiButton>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-[12px] text-[#7F7F7F]">Review details</p>
                      <div className="mt-1">
                        <CbiRow label="Beneficiary" value={name || "—"} bold />
                        <CbiRow label="IBAN / Account" value={iban || "—"} />
                        <CbiRow label="Method" value={METHOD_BADGE[method]} />
                        <CbiRow label="Country" value={country} />
                      </div>
                      <div className="mt-3 border-t border-[#E5E5E5] pt-3">
                        <p className="flex items-center gap-1.5 text-[12px] text-[#595959]">
                          <ShieldQuestion className="h-4 w-4 text-[#7A1F3D]" strokeWidth={1.8} />
                          Enter the 6-digit OTP sent to +971 5X XXX XXXX
                        </p>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••••"
                          className="mt-2 w-full border-b border-[#E8306E] bg-white pb-2 pt-1 text-center font-mono text-[20px] font-bold tracking-[0.5em] text-[#222222] outline-none placeholder:text-[#BFBFBF]"
                        />
                        <p className="mt-1 text-[10.5px] text-[#8C8C8C]">
                          Demo OTP: any 6 digits.
                        </p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <CbiButton onClick={submit} disabled={busy || otp.length !== 6}>
                          {busy ? "Submitting…" : "Submit Activation"}
                        </CbiButton>
                        <CbiButton onClick={() => setStep(1)} className="cbi-btn-outline">
                          Back
                        </CbiButton>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Add button */}
            <CbiButton onClick={() => setAddOpen(true)}>
              <span className="flex items-center justify-center gap-1.5">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add Beneficiary
              </span>
            </CbiButton>

            {/* Saved list */}
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-[15px] font-bold text-[#595959]">Saved Beneficiaries</h2>
              <span className="text-[12px] text-[#7F7F7F]">{beneficiaries.length} payees</span>
            </div>
            <div className="cbi-card">
              {beneficiaries.length === 0 && (
                <p className="px-3 py-6 text-center text-[12px] text-[#9E9E9E]">
                  No saved beneficiaries
                </p>
              )}
              {beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 border-b border-[#E5E5E5] px-3 py-3 last:border-b-0"
                >
                  <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center border border-[#D9D9D9] bg-white text-[13px] font-bold text-[#7A1F3D]">
                    {b.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-[#333333]">
                      {b.full_name}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.04em] text-[#7F7F7F]">
                      {b.iban}
                    </p>
                    <p className="mt-0.5 text-[10.5px] font-bold uppercase text-[#82134C]">
                      {METHOD_BADGE[b.method]} · {b.country}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteFor(b);
                      setConfirmDelete(false);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center text-[#8C8C8C] active:opacity-60"
                    aria-label={`Remove ${b.name}`}
                  >
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>

            <p className="px-1 text-[10.5px] leading-relaxed text-[#8C8C8C]">
              New beneficiaries are activated only after checker approval under the
              dual-authorization matrix. Removal is immediate and requires
              re-activation to be added again.
            </p>
          </>
        )}

        {/* Delete confirm modal */}
        {deleteFor && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
            <div className="cbi-card w-full max-w-sm px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-[#595959]">Remove Beneficiary</p>
                <button onClick={() => setDeleteFor(null)} aria-label="Close">
                  <X className="h-5 w-5 text-[#7F7F7F]" />
                </button>
              </div>
              {confirmDelete ? (
                <>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#7F7F7F]">
                    {deleteFor.full_name} will be removed permanently. Any scheduled
                    instructions referencing this payee must be re-created.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <CbiButton onClick={confirmDeleteBeneficiary} disabled={busy}>
                      {busy ? "…" : "Confirm Removal"}
                    </CbiButton>
                    <CbiButton onClick={() => setConfirmDelete(false)} className="cbi-btn-outline">
                      Back
                    </CbiButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2">
                    <CbiRow label="Beneficiary" value={deleteFor.full_name} bold />
                    <CbiRow label="IBAN" value={deleteFor.iban} />
                    <CbiRow label="Method" value={METHOD_BADGE[deleteFor.method]} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <CbiButton onClick={() => setConfirmDelete(true)} className="cbi-btn-outline">
                      Continue
                    </CbiButton>
                    <CbiButton onClick={() => setDeleteFor(null)}>Keep</CbiButton>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </SubPage>
  );
}
