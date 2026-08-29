import { formatWeeklyPrice, formatCurrency } from "@/lib/format";
import { getLeaseEndDate } from "@/lib/lease";
import { Field, inputClasses } from "@/components/ui/field";
import {
  HEAD_TENANT,
  EMERGENCY_NUMBERS,
  LEASE_PROSE_SECTIONS,
  LEASE_RULE_SECTIONS,
  SCHEDULE_C_FURNITURE,
} from "@/lib/lease-content";
import type {
  GovernmentIdType,
  Contract,
  Application,
  User,
} from "@/generated/prisma/client";

const GOVERNMENT_ID_LABEL: Record<GovernmentIdType, string> = {
  DRIVERS_LICENCE: "Driver Licence",
  PASSPORT: "Passport",
  OTHER: "Other",
};

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:justify-between">
      <dt className="text-foreground/50">{label}</dt>
      <dd className="font-medium text-foreground sm:text-right">{value || "—"}</dd>
    </div>
  );
}

function ScheduleRow({
  label,
  name,
  defaultValue,
  editable,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  editable: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  if (!editable || defaultValue) {
    return <SummaryRow label={label} value={defaultValue} />;
  }
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
      <label htmlFor={name} className="text-foreground/50">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className={`${inputClasses} sm:max-w-xs`}
      />
    </div>
  );
}

type LeaseDocumentContract = Pick<
  Contract,
  | "overridePriceCents"
  | "bondCents"
  | "leaseStartDate"
  | "leaseLengthMonths"
  | "agreedAt"
  | "governmentIdType"
  | "governmentIdNumber"
  | "vehicleRegistration"
  | "insuranceProvider"
  | "leaseSigned"
  | "leaseSignedAt"
  | "leaseSignedName"
>;

type LeaseDocumentApplication = Pick<
  Application,
  "legalFirstName" | "legalLastName" | "dateOfBirth" | "phone" | "email" | "employerName" | "employerContact"
>;

type LeaseDocumentUser = Pick<
  User,
  "emergencyContactName" | "emergencyContactPhone" | "emergencyContactRelationship"
>;

export function LeaseDocument({
  mode,
  room,
  contract,
  application,
  user,
  bankDetails,
}: {
  mode: "preview" | "signed";
  room: { title: string; price: number; home: { address: string } };
  contract: LeaseDocumentContract;
  application: LeaseDocumentApplication;
  user: LeaseDocumentUser;
  bankDetails: string | null;
}) {
  const editable = mode === "preview";
  const weeklyRent = contract.overridePriceCents ?? room.price;
  const startDate = contract.leaseStartDate ?? contract.agreedAt;
  const endDate = getLeaseEndDate(startDate, contract.leaseLengthMonths);
  const residentName = [application.legalFirstName, application.legalLastName].filter(Boolean).join(" ");
  const governmentIdLabel = contract.governmentIdType ? GOVERNMENT_ID_LABEL[contract.governmentIdType] : null;

  return (
    <article className="flex flex-col gap-8 text-sm">
      <header>
        <h2 className="text-lg font-semibold text-foreground">
          Co-Living Residential Sublease Agreement
        </h2>
        <p className="mt-1 text-foreground/60">{room.home.address}</p>
      </header>

      <section>
        <h3 className="text-sm font-semibold text-foreground">1. Parties &amp; Property</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow
            label="Head Tenant"
            value={`${HEAD_TENANT.name} | ABN ${HEAD_TENANT.abn}`}
          />
          <SummaryRow label="Head Tenant phone / email" value={`${HEAD_TENANT.phone} | ${HEAD_TENANT.email}`} />
          <SummaryRow label="Resident" value={residentName || null} />
          <SummaryRow
            label="Date of birth"
            value={application.dateOfBirth?.toLocaleDateString("en-AU") ?? null}
          />
          <SummaryRow label="Resident phone / email" value={[application.phone, application.email].filter(Boolean).join(" | ") || null} />
          <SummaryRow label="Property" value={room.home.address} />
          <SummaryRow label="Bedroom" value={room.title} />
          <SummaryRow label="Shared areas" value="Kitchen, Living, Bathroom, Laundry, Hallways, Outdoor areas" />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">2. Nature of Agreement &amp; Term</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow label="Start date" value={startDate.toLocaleDateString("en-AU")} />
          <SummaryRow label="End date" value={endDate.toLocaleDateString("en-AU")} />
          <SummaryRow label="Weekly rent" value={formatWeeklyPrice(weeklyRent)} />
        </dl>
        {LEASE_PROSE_SECTIONS.filter((s) => s.heading.startsWith("2.")).map((section) => (
          <div key={section.heading} className="mt-3 flex flex-col gap-2">
            {section.body.map((p, i) => (
              <p key={i} className="leading-relaxed text-foreground/70">
                {p}
              </p>
            ))}
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">3. Rent, Bond &amp; Utilities</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow label="Bond" value={contract.bondCents != null ? formatCurrency(contract.bondCents) : null} />
          <SummaryRow label="Bank details for payment" value={bankDetails} />
        </dl>
        {LEASE_PROSE_SECTIONS.filter((s) => s.heading.startsWith("3.")).map((section) => (
          <div key={section.heading} className="mt-3 flex flex-col gap-2">
            {section.body.map((p, i) => (
              <p key={i} className="leading-relaxed text-foreground/70">
                {p}
              </p>
            ))}
          </div>
        ))}
      </section>

      {LEASE_RULE_SECTIONS.filter((s) => !s.heading.startsWith("Schedule")).map((section) => (
        <section key={section.heading}>
          <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10">
            {section.rows.map((row) => (
              <SummaryRow key={row.area} label={row.area} value={row.detail} />
            ))}
          </dl>
        </section>
      ))}

      {LEASE_PROSE_SECTIONS.filter((s) => s.heading.startsWith("7.") || s.heading.startsWith("9.")).map(
        (section) => (
          <section key={section.heading}>
            <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
            <div className="mt-2 flex flex-col gap-2">
              {section.body.map((p, i) => (
                <p key={i} className="leading-relaxed text-foreground/70">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ),
      )}

      <section>
        <h3 className="text-sm font-semibold text-foreground">Schedule A — Property &amp; Emergency Information</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow label="Police / Fire / Ambulance" value={EMERGENCY_NUMBERS.policeFireAmbulance} />
          <SummaryRow label="SES" value={EMERGENCY_NUMBERS.ses} />
          <SummaryRow label="Head Tenant" value={`${HEAD_TENANT.phone} | ${HEAD_TENANT.email}`} />
          <SummaryRow label="Alternative contact" value={EMERGENCY_NUMBERS.alternativeContact} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Schedule B — Resident Information</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow label="Full name" value={residentName || null} />
          <SummaryRow label="DOB" value={application.dateOfBirth?.toLocaleDateString("en-AU") ?? null} />
          {governmentIdLabel ? (
            <SummaryRow label="Government ID type" value={governmentIdLabel} />
          ) : (
            <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="governmentIdType" className="text-foreground/50">
                Government ID type
              </label>
              <select
                id="governmentIdType"
                name="governmentIdType"
                required
                defaultValue=""
                className={`${inputClasses} sm:max-w-xs`}
              >
                <option value="" disabled>
                  Select ID type
                </option>
                <option value="DRIVERS_LICENCE">Driver Licence</option>
                <option value="PASSPORT">Passport</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          )}
          <ScheduleRow
            label="Government ID number"
            name="governmentIdNumber"
            defaultValue={contract.governmentIdNumber}
            editable={editable}
            required
          />
          <SummaryRow label="Phone / Email" value={[application.phone, application.email].filter(Boolean).join(" | ") || null} />
          <SummaryRow label="Employer / Contact" value={[application.employerName, application.employerContact].filter(Boolean).join(" | ") || null} />
          <ScheduleRow
            label="Emergency contact name"
            name="emergencyContactName"
            defaultValue={user.emergencyContactName}
            editable={editable}
            required
          />
          <ScheduleRow
            label="Emergency contact relationship"
            name="emergencyContactRelationship"
            defaultValue={user.emergencyContactRelationship}
            editable={editable}
            required
          />
          <ScheduleRow
            label="Emergency contact phone"
            name="emergencyContactPhone"
            defaultValue={user.emergencyContactPhone}
            editable={editable}
            required
          />
          <ScheduleRow
            label="Vehicle registration (optional)"
            name="vehicleRegistration"
            defaultValue={contract.vehicleRegistration}
            editable={editable}
          />
          <ScheduleRow
            label="Insurance provider (optional)"
            name="insuranceProvider"
            defaultValue={contract.insuranceProvider}
            editable={editable}
          />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Schedule C — Furniture &amp; Inventory</h3>
        <dl className="mt-2 divide-y divide-venturo-olive/10">
          <SummaryRow label="Bedroom" value={room.title} />
          {SCHEDULE_C_FURNITURE.map((row) => (
            <SummaryRow key={row.area} label={row.area} value={row.items} />
          ))}
        </dl>
      </section>

      {LEASE_RULE_SECTIONS.filter((s) => s.heading.startsWith("Schedule")).map((section) => (
        <section key={section.heading}>
          <h3 className="text-sm font-semibold text-foreground">{section.heading}</h3>
          <dl className="mt-2 divide-y divide-venturo-olive/10">
            {section.rows.map((row) => (
              <SummaryRow key={row.area} label={row.area} value={row.detail} />
            ))}
          </dl>
        </section>
      ))}

      <section className="rounded-xl border border-venturo-olive/15 bg-venturo-cream-alt p-5">
        <h3 className="text-sm font-semibold text-foreground">Acknowledgement &amp; Signatures</h3>
        <p className="mt-2 leading-relaxed text-foreground/70">
          By signing, the Resident acknowledges that they have read and understood this Agreement,
          received or will receive the House Rules, had an opportunity to ask questions, and received
          or will receive the Condition Report and Inventory.
        </p>
        <dl className="mt-3 divide-y divide-venturo-olive/15">
          <SummaryRow label="Head Tenant / Sublessor" value={`${HEAD_TENANT.name} — approved electronically by Venturo admin`} />
          <SummaryRow label="Head Tenant approval date" value={contract.agreedAt.toLocaleDateString("en-AU")} />
        </dl>

        {mode === "signed" ? (
          <dl className="mt-3 divide-y divide-venturo-olive/15">
            <SummaryRow label="Resident signature" value={contract.leaseSignedName} />
            <SummaryRow
              label="Resident signed date"
              value={contract.leaseSignedAt?.toLocaleString("en-AU") ?? null}
            />
          </dl>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <Field label="Type your full legal name to sign" hint="This is your electronic signature on this Agreement.">
              <input name="leaseSignedName" required className={inputClasses} placeholder={residentName || "Full name"} />
            </Field>
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input type="checkbox" name="agree" required value="1" className="mt-0.5" />
              <span>
                I have read and understood this Agreement, including the House Rules, and I agree to be
                bound by it.
              </span>
            </label>
          </div>
        )}
      </section>
    </article>
  );
}
