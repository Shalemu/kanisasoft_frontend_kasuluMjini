"use client";

import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemberForm } from "@/hooks/useMemberForm";
import Field from "@/components/form/field";
import Select from "@/components/form/Select";
import PasswordField from "@/components/form/PasswordField";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "@/components/form/date-picker";
import { apiFetch } from "@/lib/api";
import { isMarriedStatus, MARITAL_STATUS_OPTIONS } from "@/lib/memberLabels";

export default function OngezaMshirika() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [initialMember, setInitialMember] = useState<any>(null);
  const [resolvedEditUserId, setResolvedEditUserId] = useState<string | null>(editId);
  const [loadingMember, setLoadingMember] = useState(Boolean(editId));

  useEffect(() => {
    async function loadMember() {
      if (!editId) {
        setResolvedEditUserId(null);
        setLoadingMember(false);
        return;
      }

      try {
        try {
          const data = await apiFetch(`/members/by-user/${editId}`);
          const member = data.member ?? data.user ?? data.data?.member ?? null;

          setInitialMember(member);
          setResolvedEditUserId(String(member?.user_id ?? editId));
          return;
        } catch {
          const requestedId = Number(editId);
          const data = await apiFetch("/users");
          const user = data?.users?.find(
            (item: any) =>
              item.id === requestedId ||
              item.user_id === requestedId ||
              item.member_id === requestedId
          );

          setInitialMember(user ?? null);
          setResolvedEditUserId(user ? String(user.user_id ?? user.id) : editId);
        }
      } finally {
        setLoadingMember(false);
      }
    }

    void loadMember();
  }, [editId]);
  
  const {
    form,
    loading,
    isEditMode,
    activeTab,
    setActiveTab,
    tabTitles,
    handleChange,
    handleNext,
    handleRegister,
  } = useMemberForm(router, {
    mode: editId ? "edit" : "create",
    userId: resolvedEditUserId ?? editId,
    initialData: initialMember,
  });

    const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));
  const months = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Machi' },
    { value: '4', label: 'Aprili' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Julai' }, { value: '8', label: 'Agosti' }, { value: '9', label: 'Septemba' },
    { value: '10', label: 'Oktoba' }, { value: '11', label: 'Novemba' }, { value: '12', label: 'Desemba' },
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

const handleDateChange = (dates: Date[]) => {
  const date = dates?.[0];

  handleChange({
    target: {
      name: "birthDate",
      value: date ? date.toISOString().split("T")[0] : "",
    },
  } as any);
};

const getPhoneMaxLength = (value: string) =>
  value.startsWith("255") || value === "2" || value === "25" ? 12 : 10;


  // TAB CONTENT


  const renderTabContent = () => {
    switch (activeTab) {

    
      // TAB 1 - TAARIFA BINAFSI
    

case 0:
  return (
    <>
      <Field
        label="Jina Kamili *"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
      />

      {/* Gender */}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          Jinsia *
        </label>

   <Select
 
  name="gender"
  value={form.gender}
  onChange={handleChange}
  options={[
    {
      value: "Mwanaume",
      label: "Mwanaume",
    },
    {
      value: "Mwanamke",
      label: "Mwanamke",
    },
  ]}
/>
      </div>



<div className="relative">
<DatePicker
  id="birthDate"
  label="Tarehe ya Kuzaliwa *"
  defaultDate={form.birthDate ? new Date(form.birthDate) : undefined}
  onChange={handleDateChange}
/>

  {/* ICON (click opens picker properly) */}
  <button
    type="button"
    onClick={() => {
      const input = document.querySelector(
        '[name="birthDate"] input'
      ) as HTMLInputElement | null;

      input?.focus();
      input?.click?.();
    }}
    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
  >
    <Calendar size={18} />
  </button>

</div>


      <Field
        label="Mkoa Ulipozaliwa *"
        name="birthRegion"
        value={form.birthRegion}
        onChange={handleChange}
      />

      <Field
        label="Wilaya Ulipozaliwa *"
        name="birthDistrict"
        value={form.birthDistrict}
        onChange={handleChange}
      />

      <Field
        label="Kata Ulipozaliwa"
        name="birthWard"
        value={form.birthWard}
        onChange={handleChange}
      />

      <Field
        label="Mtaa Ulipozaliwa"
        name="birthStreet"
        value={form.birthStreet}
        onChange={handleChange}
      />

      <Field
        label="Kata Unapoishi *"
        name="residentialWard"
        value={form.residentialWard}
        onChange={handleChange}
      />

      <Field
        label="Mtaa Unapoishi *"
        name="residentialStreet"
        value={form.residentialStreet}
        onChange={handleChange}
      />

      {/* Mtaa */}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          Mtaa *
        </label>

    <Select

  name="zone"
  value={form.zone}
  onChange={handleChange}
  options={[
    { value: "MURUBOMBO", label: "MURUBOMBO" },
    { value: "MURUSI B", label: "MURUSI B" },
    { value: "KIGANAMO", label: "KIGANAMO" },
    { value: "MURUSI A", label: "MURUSI A" },
    { value: "KUMUNYIKA B", label: "KUMUNYIKA B" },
    { value: "KAGUNGA C", label: "KAGUNGA C" },
    { value: "KUMUNYIKA A", label: "KUMUNYIKA A" },
    { value: "KAGUNGA B", label: "KAGUNGA B" },
    { value: "MURUBONA A", label: "MURUBONA A" },
    { value: "KAGUNGA A", label: "KAGUNGA A" },
    { value: "MURUBONA B", label: "MURUBONA B" },
  ]}
/>
      </div>

      {/* Marital Status */}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          Hali ya ndoa *
        </label>

        <Select

  name="maritalStatus"
  value={form.maritalStatus}
  onChange={handleChange}
options={[
  ...MARITAL_STATUS_OPTIONS,
]}
/>
      </div>

      {/* Marriage Type */}

      {isMarriedStatus(form.maritalStatus) && (
        <>
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Aina ya Ndoa *
            </label>

            <Select

  name="marriageType"
  value={form.marriageType}
  onChange={handleChange}
  options={[
    { value: "Kikristo", label: "Kikristo" },
    { value: "Kiserikali", label: "Kiserikali" },
    { value: "Kienyeji", label: "Kienyeji" },
  ]}
/>
          </div>

          <Field
            label="Jina la Mwenza *"
            name="spouseName"
            value={form.spouseName}
            onChange={handleChange}
          />
        </>
      )}

      <Field
        label="Idadi ya Watoto"
        name="childrenCount"
        type="number"
        value={form.childrenCount}
        onChange={handleChange}
      />

      <Field
        label="Namba ya Simu *"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={getPhoneMaxLength(form.phone)}
      />

      <Field
        label="Namba ya WhatsApp"
        name="whatsappNumber"
        type="tel"
        value={form.whatsappNumber}
        onChange={handleChange}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={getPhoneMaxLength(form.whatsappNumber)}
      />

      <Field
        label="Barua Pepe"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
      />

      {!isEditMode && (
        <>
          <PasswordField
            label="Neno la Siri *"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <PasswordField
            label="Thibitisha Neno la Siri *"
            name="passwordConfirmation"
            value={form.passwordConfirmation}
            onChange={handleChange}
          />
        </>
      )}

      {/* Disability */}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          Je, una ulemavu? *
        </label>

        <Select

  name="hasDisability"
  value={form.hasDisability}
  onChange={handleChange}
  options={[
    { value: "ndio", label: "Ndio" },
    { value: "hapana", label: "Hapana" },
  ]}
/>
      </div>

      {form.hasDisability === "ndio" && (
        <Field
          label="Eleza aina ya ulemavu *"
          name="disabilityDescription"
          value={form.disabilityDescription}
          onChange={handleChange}
        />
      )}

    </>
  );


      // TAB 2 - IMANI
      
case 1:
  return (
    <>
      <div className="col-span-full">
  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
    Tarehe ya Kuokoka *
  </label>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

    {/* YEAR */}
    <select
      name="conversionYear"
      value={form.conversionYear}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Mwaka *</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>

    {/* MONTH */}
    <select
      name="conversionMonth"
      value={form.conversionMonth}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Mwezi *</option>
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>

    {/* DAY */}
    <select
      name="conversionDay"
      value={form.conversionDay}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Siku *</option>
      {days.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>

  </div>
</div>
      {/* ===== ROW 1 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
        <Field
          label="Kanisa / Mahali Ulipookoka"
          name="churchOfConversion"
          value={form.churchOfConversion}
          onChange={handleChange}
        />

        <Field
          label="Mahali Ulipobatizwa"
          name="baptismPlace"
          value={form.baptismPlace}
          onChange={handleChange}
        />

        <Field
          label="Aliyekubatiza *"
          name="baptizerName"
          value={form.baptizerName}
          onChange={handleChange}
        />
      </div>

      <div className="col-span-full">

  <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
    Tarehe ya Ubatizo *
  </label>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

    {/* YEAR */}
    <select
      name="baptismYear"
      value={form.baptismYear}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Mwaka *</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>

    {/* MONTH */}
    <select
      name="baptismMonth"
      value={form.baptismMonth}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Mwezi *</option>
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>

    {/* DAY */}
    <select
      name="baptismDay"
      value={form.baptismDay}
      onChange={handleChange}
      className="
        w-full rounded-xl border border-gray-300 bg-white px-4 py-3
        text-gray-900 shadow-sm outline-none transition
        dark:border-gray-700 dark:bg-gray-900 dark:text-white/90
        focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      "
    >
      <option value="">Siku *</option>
      {days.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>

  </div>
</div>

      {/* ===== ROW 2 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
        <Field
          label="Cheo cha Aliyekubatiza *"
          name="baptizerTitle"
          value={form.baptizerTitle}
          onChange={handleChange}
        />

        <Select
          label="Umehamia / Umeokoka Hapa? *"
          name="previousChurchStatus"
          value={form.previousChurchStatus}
          onChange={handleChange}
          options={[
            { value: "Nimehamia", label: "Nimehamia" },
            { value: "Nimeokoka hapa", label: "Nimeokoka hapa" },
          ]}
        />

        <Field
          label="Huduma Unayofanya"
          name="churchService"
          value={form.churchService}
          onChange={handleChange}
        />
      </div>

      {/* ===== IF NIMEHAMIA ===== */}
      {form.previousChurchStatus === "Nimehamia" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
          <Field
            label="Mwaka wa Kuhamia *"
            name="tanguLini"
            type="number"
            value={form.tanguLini}
            onChange={handleChange}
          />

          <Field
            label="Kanisa Ulipotoka *"
            name="kanisaUlipotoka"
            value={form.kanisaUlipotoka}
            onChange={handleChange}
          />

          <Select
            label="Je, Unashiriki Meza ya Bwana? *"
            name="participatesCommunion"
            value={form.participatesCommunion}
            onChange={handleChange}
            options={[
              { value: "ndio", label: "Ndio" },
              { value: "hapana", label: "Hapana" },
            ]}
          />
        </div>
      )}

      {/* ===== IF SI NIMEHAMIA ===== */}
      {form.previousChurchStatus !== "Nimehamia" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
          <Select
            label="Je, Unashiriki Meza ya Bwana? *"
            name="participatesCommunion"
            value={form.participatesCommunion}
            onChange={handleChange}
            options={[
              { value: "ndio", label: "Ndio" },
              { value: "hapana", label: "Hapana" },
            ]}
          />
        </div>
      )}
    </>
  );
  
      // TAB 3 - ELIMU
  

     case 2:
  return (
    <>
      {/* ===== ROW 1 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
        <Select
          label="Kiwango cha Elimu *"
          name="educationLevel"
          value={form.educationLevel}
          onChange={handleChange}
          options={[
            { value: "Sijasoma", label: "Sijasoma" },
            { value: "Elimu ya msingi", label: "Elimu ya msingi" },
            { value: "Elimu ya sekondari", label: "Elimu ya sekondari" },
            { value: "Elimu ya chuo", label: "Elimu ya chuo" },
            { value: "Elimu ya chuo kikuu", label: "Elimu ya chuo kikuu" },
          ]}
        />

        <Field
          label="Taaluma (Hiari)"
          name="profession"
          value={form.profession}
          onChange={handleChange}
        />

        <Select
          label="Aina ya Kazi au Shughuli *"
          name="occupation"
          value={form.occupation}
          onChange={handleChange}
          options={[
            { value: "Nimeajiriwa", label: "Nimeajiriwa" },
            { value: "Nimejiajiri", label: "Nimejiajiri" },
            { value: "Mwanafunzi", label: "Mwanafunzi" },
            { value: "Sina kazi", label: "Sina kazi" },
          ]}
        />
      </div>

      {/* ===== ROW 2 (CONDITIONAL) ===== */}
      {(form.occupation === "Nimeajiriwa" ||
        form.occupation === "Nimejiajiri") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 col-span-full mt-2">
          <Field
            label="Kazi au Shughuli gani? (Hiari)"
            name="workPlace"
            value={form.workPlace}
            onChange={handleChange}
          />

          <Field
            label="Mawasiliano ya Kazi (Hiari)"
            name="workContact"
            value={form.workContact}
            onChange={handleChange}
          />
        </div>
      )}
    </>
  );
      
      // TAB 4 - FAMILIA

     case 3:
  return (
    <>
      {/* ===== ROW 1 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full">
        <Select
          label="Unaishi Peke Yako? *"
          name="livesAlone"
          value={form.livesAlone}
          onChange={handleChange}
          options={[
            { value: "ndio", label: "Ndio" },
            { value: "hapana", label: "Hapana" },
          ]}
        />

        <Field
          label="Jina la Mtu wa Karibu"
          name="nextOfKin"
          value={form.nextOfKin}
          onChange={handleChange}
        />

        <Field
          label="Namba ya Simu ya Mtu wa Karibu"
          name="nextOfKinPhone"
          value={form.nextOfKinPhone}
          onChange={handleChange}
          type="tel"
        />
      </div>

      {/* ===== CONDITIONAL FAMILY INFO ===== */}
      {form.livesAlone === "hapana" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-full mt-2">
          <Select
            label="Nafasi yako katika Familia"
            name="familyRole"
            value={form.familyRole}
            onChange={handleChange}
            options={[
              { value: "Mzazi", label: "Mzazi" },
              { value: "Mtoto", label: "Mtoto" },
              { value: "Ndugu", label: "Ndugu" },
              { value: "Mume", label: "Mume" },
              { value: "Mke", label: "Mke" },
            ]}
          />

          <Select
            label="Anaishi na nani"
            name="liveWithWho"
            value={form.liveWithWho}
            onChange={handleChange}
            options={[
              { value: "Wazazi", label: "Wazazi" },
              { value: "Ndugu", label: "Ndugu" },
              { value: "Marafiki", label: "Marafiki" },
              { value: "Mume", label: "Mume" },
              { value: "Mke", label: "Mke" },
              { value: "Wengine", label: "Wengine" },
            ]}
          />

          {/* empty slot for perfect 3-column alignment */}
          <div />
        </div>
      )}
    </>
  );

      default:
        return null;
    }
  };

 
  // PAGE


  return (
  <>
    <Head>
      <title>{isEditMode ? "Hariri Mshirika" : "Sajili Mshirika"}</title>
    </Head>

    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-800 dark:bg-gray-900 dark:text-white/90">

      <div className="mx-auto max-w-6xl">

     {/* Header */}
<div className="mb-10 text-center relative">

  {/* subtle background glow */}
  <div className="absolute inset-0 -z-10 flex justify-center">
    <div className="h-24 w-72 rounded-full bg-blue-100 blur-3xl opacity-40" />
  </div>

  {/* Title */}
  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white/90">
    {isEditMode ? "Hariri Taarifa za Mshirika" : "Fomu ya Usajili wa Mshirika"}
  </h1>

  {/* Accent line */}
  <div className="mt-4 flex justify-center">
    <div className="h-0.75 w-20 rounded-full bg-linear-to-r from-gray-300 via-gray-500 to-gray-300" />
  </div>

  {/* Subtitle */}
  <p className="mt-5 text-sm md:text-base text-gray-500 max-w-xl mx-auto leading-relaxed dark:text-gray-400">
    {isEditMode
      ? "Taarifa zilizopo zimejazwa tayari. Rekebisha sehemu zinazohitajika kisha hifadhi."
      : "Jaza taarifa zote muhimu ili kukamilisha usajili kwa usahihi na kuhifadhi taarifa zako vizuri kwenye mfumo."}
  </p>

</div>

        {/* Main Container */}
        <div className="overflow-hidden rounded-4xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-white/[0.03]">

          {/* Progress Tabs */}
          <div className="border-b border-gray-100 px-6 py-6 dark:border-gray-800">

            <div className="flex flex-wrap items-center justify-center gap-3">

              {tabTitles.map((tab, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`relative rounded-full px-5 py-3 text-sm font-medium transition-all duration-300
                    ${
                      activeTab === index
                        ? "bg-[#f0ce32] text-black shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-300 dark:hover:bg-white/[0.1]"
                    }
                  `}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs">
                    {index + 1}
                  </span>

                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="p-8 md:p-10">

            {loadingMember ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Inapakia taarifa za mshirika...
              </div>
            ) : (
            <form
              onSubmit={
                activeTab === tabTitles.length - 1
                  ? handleRegister
                  : handleNext
              }
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {renderTabContent()}

              <div className="col-span-full mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#f0ce32] py-4 text-base font-bold text-black shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                >
                  {loading
                    ? isEditMode ? "Inahifadhi..." : "Inasajili..."
                    : activeTab === tabTitles.length - 1
                    ? isEditMode ? "HIFADHI MABADILIKO" : "JISAJILI SASA"
                    : "ENDELEA"}
                </button>
              </div>
            </form>
            )}
          </div>

        </div>

      </div>
    </div>
  </>
);
}
