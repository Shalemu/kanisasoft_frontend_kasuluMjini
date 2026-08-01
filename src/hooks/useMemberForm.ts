"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import {
  isMarriedStatus,
  normalizeGenderValue,
  normalizeMaritalStatusForApi,
} from "@/lib/memberLabels";

export interface MemberFormData {
  fullName: string;
  gender: string;
  birthDate: string;

  birthRegion: string;
  birthDistrict: string;
  birthWard: string;
  birthStreet: string;
  birthPlace: string;

  residentialWard: string;
  residentialStreet: string;
  residence: string;

  maritalStatus: string;
  marriageType: string;
  spouseName: string;
  childrenCount: string;

  zone: string;
  phone: string;
  whatsappNumber: string;
  email: string;

  password: string;
  passwordConfirmation: string;

  hasDisability: string;
  disabilityDescription: string;

  conversionYear: string;
  conversionMonth: string;
  conversionDay: string;

  churchOfConversion: string;

  baptismYear: string;
  baptismMonth: string;
  baptismDay: string;

  baptismPlace: string;
  baptizerName: string;
  baptizerTitle: string;

  previousChurchStatus: string;
  tanguLini: string;
  kanisaUlipotoka: string;

  churchService: string;
  participatesCommunion: string;

  serviceDuration: string;
  educationLevel: string;
  profession: string;
  occupation: string;

  workPlace: string;
  workContact: string;

  livesAlone: string;
  livesWith: string;
  familyRole: string;
  liveWithWho: string;

  nextOfKin: string;
  nextOfKinPhone: string;
}

export const getEmptyMemberForm = (): MemberFormData => ({
  fullName: "",
  gender: "",
  birthDate: "",

  birthRegion: "",
  birthDistrict: "",
  birthWard: "",
  birthStreet: "",
  birthPlace: "",

  residentialWard: "",
  residentialStreet: "",
  residence: "",

  maritalStatus: "",
  marriageType: "",
  spouseName: "",
  childrenCount: "",

  zone: "",
  phone: "",
  whatsappNumber: "",
  email: "",

  password: "",
  passwordConfirmation: "",

  hasDisability: "",
  disabilityDescription: "",

  conversionYear: "",
  conversionMonth: "",
  conversionDay: "",

  churchOfConversion: "",

  baptismYear: "",
  baptismMonth: "",
  baptismDay: "",

  baptismPlace: "",
  baptizerName: "",
  baptizerTitle: "",

  previousChurchStatus: "",
  tanguLini: "",
  kanisaUlipotoka: "",

  churchService: "",
  participatesCommunion: "",

  serviceDuration: "",
  educationLevel: "",
  profession: "",
  occupation: "",

  workPlace: "",
  workContact: "",

  livesAlone: "",
  livesWith: "",
  familyRole: "",
  liveWithWho: "",

  nextOfKin: "",
  nextOfKinPhone: "",
});

function splitDateParts(dateValue?: string | null) {
  if (!dateValue) return { year: "", month: "", day: "" };

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return { year: "", month: "", day: "" };

  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1),
    day: String(date.getDate()),
  };
}

function normalizeYesNo(value: unknown) {
  const normalized = typeof value === "string" ? value.toLowerCase() : value;

  if (
    normalized === true ||
    normalized === 1 ||
    normalized === "1" ||
    normalized === "ndio" ||
    normalized === "yes"
  ) {
    return "ndio";
  }

  if (
    normalized === false ||
    normalized === 0 ||
    normalized === "0" ||
    normalized === "hapana" ||
    normalized === "no"
  ) {
    return "hapana";
  }

  return "";
}

function isValidTanzaniaPhone(value: string) {
  return /^0\d{9}$/.test(value) || /^255\d{9}$/.test(value);
}

function getFieldError(errors: unknown, keys: string[]) {
  if (!errors || typeof errors !== "object") return "";

  for (const key of keys) {
    const value = (errors as Record<string, unknown>)[key];
    if (Array.isArray(value) && value[0]) return String(value[0]);
    if (typeof value === "string") return value;
  }

  return "";
}

export function mapMemberToForm(member: any): MemberFormData {
  const conversion = splitDateParts(member.date_of_conversion);
  const baptism = splitDateParts(member.baptism_date);

  return {
    ...getEmptyMemberForm(),
    fullName: member.full_name ?? "",
    gender: member.gender === "M" ? "Mwanaume" : member.gender === "F" ? "Mwanamke" : member.gender ?? "",
    birthDate: member.birth_date?.slice?.(0, 10) ?? "",
    birthRegion: member.birth_region ?? "",
    birthDistrict: member.birth_district ?? member.birth_place ?? "",
    birthWard: member.birth_ward ?? "",
    birthStreet: member.birth_street ?? "",
    birthPlace: member.birth_place ?? "",
    residentialWard: member.residential_ward ?? "",
    residentialStreet: member.residential_street ?? "",
    residence: member.residence ?? "",
    maritalStatus: normalizeMaritalStatusForApi(member.marital_status ?? "", member.gender ?? ""),
    marriageType: member.marriage_type ?? "",
    spouseName: member.spouse_name ?? "",
    childrenCount: String(member.children_count ?? member.number_of_children ?? ""),
    zone: member.zone ?? member.residential_zone ?? "",
    phone: member.phone ?? member.phone_number ?? "",
    whatsappNumber: member.whatsapp_number ?? "",
    email: member.email ?? "",
    hasDisability: normalizeYesNo(member.has_disability),
    disabilityDescription: member.disability_description ?? "",
    conversionYear: String(member.conversion_year ?? conversion.year),
    conversionMonth: String(member.conversion_month ?? conversion.month),
    conversionDay: String(member.conversion_day ?? conversion.day),
    churchOfConversion: member.church_of_conversion ?? "",
    baptismYear: String(member.baptism_year ?? baptism.year),
    baptismMonth: String(member.baptism_month ?? baptism.month),
    baptismDay: String(member.baptism_day ?? baptism.day),
    baptismPlace: member.baptism_place ?? "",
    baptizerName: member.baptizer_name ?? "",
    baptizerTitle: member.baptizer_title ?? "",
    previousChurchStatus: member.previous_church_status ?? "",
    tanguLini: member.tangu_lini ?? "",
    kanisaUlipotoka: member.kanisa_ulipotoka ?? member.previous_church ?? "",
    churchService: member.church_service ?? "",
    participatesCommunion: normalizeYesNo(member.participates_communion),
    serviceDuration: member.service_duration ?? "",
    educationLevel: member.education_level ?? "",
    profession: member.profession ?? "",
    occupation: member.occupation ?? "",
    workPlace: member.work_place ?? "",
    workContact: member.work_contact ?? "",
    livesAlone: normalizeYesNo(member.lives_alone),
    livesWith: member.lives_with ?? "",
    familyRole: member.family_role ?? "",
    liveWithWho: member.live_with_who ?? member.lives_with ?? "",
    nextOfKin: member.next_of_kin ?? "",
    nextOfKinPhone: member.next_of_kin_phone ?? "",
  };
}

type UseMemberFormOptions = {
  mode?: "create" | "edit";
  userId?: string | number | null;
  initialData?: any;
};

export function useMemberForm(router: any, options: UseMemberFormOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const isEditMode = options.mode === "edit";

  const tabTitles = [
    "Taarifa Binafsi",
    "Taarifa za Imani",
    "Elimu na Kazi",
    "Familia",
  ];

  

  
const [form, setForm] = useState<MemberFormData>(getEmptyMemberForm());

  useEffect(() => {
    if (options.initialData) {
      setForm(mapMemberToForm(options.initialData));
    }
  }, [options.initialData]);
  

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "maritalStatus" &&
      !isMarriedStatus(normalizeMaritalStatusForApi(value, prev.gender))
        ? {
            marriageType: "",
            spouseName: "",
          }
        : {}),

      ...(name === "hasDisability" && value === "hapana"
        ? {
            disabilityDescription: "",
          }
        : {}),

      ...(name === "livesAlone" && value === "ndio"
        ? {
            familyRole: "",
            liveWithWho: "",
            livesWith: "",
          }
        : {}),
    }));
  };

  // =========================
  // VALIDATION
  // =========================

  const validatePersonalInfo = () => {
    const required = [
      "fullName",
      "gender",
      "birthDate",
      "birthRegion",
      "birthDistrict",
      "residentialWard",
      "residentialStreet",
      "zone",
      "maritalStatus",
      "phone",
      "hasDisability",
    ];

    if (!isEditMode) {
      required.push("password", "passwordConfirmation");
    }

    for (const key of required) {
      if (!form[key as keyof MemberFormData]) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa zote muhimu.",
          icon: "warning",
        });

        setActiveTab(0);
        return false;
      }
    }

    if (
      isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender)) &&
      !form.marriageType
    ) {
      Swal.fire({
        title: "Tahadhari",
        text: "Chagua aina ya ndoa.",
        icon: "warning",
      });

      return false;
    }

    if (form.hasDisability === "ndio" && !form.disabilityDescription.trim()) {
      Swal.fire({
        title: "Tahadhari",
        text: "Eleza aina ya ulemavu.",
        icon: "warning",
      });

      return false;
    }

    if (!isEditMode && form.password !== form.passwordConfirmation) {
      Swal.fire({
        title: "Tatizo",
        text: "Password hazifanani.",
        icon: "error",
      });

      return false;
    }

    if (form.email) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {
        Swal.fire({
          title: "Email sio sahihi",
          icon: "error",
        });

        return false;
      }
    }

    if (!isValidTanzaniaPhone(form.phone)) {
      Swal.fire({
        title: "Namba ya simu sio sahihi",
        text: "Tumia mfumo wa 0712345678 au 255712345678.",
        icon: "error",
      });

      return false;
    }

    if (form.whatsappNumber && !isValidTanzaniaPhone(form.whatsappNumber)) {
      Swal.fire({
        title: "Namba ya WhatsApp sio sahihi",
        text: "Tumia mfumo wa 0712345678 au 255712345678.",
        icon: "error",
      });

      return false;
    }

    return true;
  };

  const validateFaithInfo = () => {
    const required = [
      "conversionYear",
      "churchOfConversion",
      "baptismYear",
      "baptizerName",
      "baptizerTitle",
      "previousChurchStatus",
    ];

    for (const key of required) {
      if (!form[key as keyof MemberFormData]) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa za imani.",
          icon: "warning",
        });

        setActiveTab(1);
        return false;
      }
    }

    if (
      form.previousChurchStatus === "Nimehamia"
    ) {
      if (
        !form.tanguLini ||
        !form.kanisaUlipotoka
      ) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa za kanisa ulipotoka.",
          icon: "warning",
        });

        return false;
      }
    }

    return true;
  };

  // =========================
  // NEXT
  // =========================

  const handleNext = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      activeTab === 0 &&
      !validatePersonalInfo()
    )
      return;

    if (
      activeTab === 1 &&
      !validateFaithInfo()
    )
      return;

    if (activeTab < tabTitles.length - 1) {
      setActiveTab((prev) => prev + 1);
    }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validatePersonalInfo()) return;
    if (!validateFaithInfo()) return;

    const payload = {
      full_name: form.fullName,
      gender: normalizeGenderValue(form.gender),

      birth_date: form.birthDate,
      birth_place:
        form.birthPlace || form.birthDistrict,

      birth_region: form.birthRegion,
      birth_district: form.birthDistrict,
      birth_ward: form.birthWard,
      birth_street: form.birthStreet,

      residence:
        form.residence ||
        `${form.residentialStreet}, ${form.residentialWard}`,

      residential_ward: form.residentialWard,
      residential_street:
        form.residentialStreet,

      marital_status: normalizeMaritalStatusForApi(form.maritalStatus, form.gender),
      marriage_type: isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender))
        ? form.marriageType
        : null,
      spouse_name: isMarriedStatus(normalizeMaritalStatusForApi(form.maritalStatus, form.gender))
        ? form.spouseName
        : "",

      children_count:
        Number(form.childrenCount) || 0,

      zone: form.zone,
      phone: form.phone,
      phone_number: form.phone,
      whatsapp_number:
        form.whatsappNumber,

      email: form.email,

      ...(isEditMode
        ? {}
        : {
            password: form.password,
            password_confirmation: form.passwordConfirmation,
          }),

      has_disability:
        form.hasDisability === "ndio",

      disability_description:
        form.hasDisability === "ndio" ? form.disabilityDescription : "",

      conversion_year:
        Number(form.conversionYear) || null,

      conversion_month:
        Number(form.conversionMonth) || null,

      conversion_day:
        Number(form.conversionDay) || null,

      church_of_conversion:
        form.churchOfConversion,

      baptism_year:
        Number(form.baptismYear) || null,

      baptism_month:
        Number(form.baptismMonth) || null,

      baptism_day:
        Number(form.baptismDay) || null,

      baptism_place:
        form.baptismPlace,

      baptizer_name:
        form.baptizerName,

      baptizer_title:
        form.baptizerTitle,

      previous_church_status:
        form.previousChurchStatus,

      tangu_lini:
        form.tanguLini,

      kanisa_ulipotoka:
        form.kanisaUlipotoka,

      church_service:
        form.churchService,

      participates_communion:
        form.participatesCommunion === "ndio",

      education_level:
        form.educationLevel,

      profession:
        form.profession,

      occupation:
        form.occupation,

      work_place:
        form.workPlace,

      work_contact: form.workContact,

      lives_alone:
        form.livesAlone === "ndio",

      family_role:
        form.familyRole,

      live_with_who:
        form.liveWithWho,

      next_of_kin:
        form.nextOfKin,

      next_of_kin_phone:
        form.nextOfKinPhone,
    };

    try {
      setLoading(true);

      const response = await apiFetch(
        isEditMode ? `/users/${options.userId}` : "/register",
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

   if (!response.error) {
  Swal.fire({
    title: isEditMode ? "Taarifa zimehifadhiwa" : "Usajili umefanikiwa",
    icon: "success",
  });

  if (isEditMode) {
    router.push(`/washirika/detail?id=${options.userId}`);
    router.refresh?.();
  } else {
    setForm(getEmptyMemberForm());
    setActiveTab(0);
  }
} else {
        Swal.fire({
          title: "Tatizo",
          text: response.message,
          icon: "error",
        });
      }
    } catch (error: any) {
      const phoneError = getFieldError(error?.errors, ["phone_number", "phone"]);
      const whatsappError = getFieldError(error?.errors, ["whatsapp_number"]);

      Swal.fire({
        title: "Tatizo",
        text:
          phoneError ||
          whatsappError ||
          error?.message ||
          "Tatizo limetokea",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => String(currentYear - i)
  );

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Machi" },
    { value: "4", label: "Aprili" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Julai" },
    { value: "8", label: "Agosti" },
    { value: "9", label: "Septemba" },
    { value: "10", label: "Oktoba" },
    { value: "11", label: "Novemba" },
    { value: "12", label: "Desemba" },
  ];

  const days = Array.from(
    { length: 31 },
    (_, i) => String(i + 1)
  );

  return {
    form,
    loading,
    isEditMode,
    activeTab,
    setActiveTab,
    tabTitles,

    handleChange,
    handleNext,
    handleRegister,

    years,
    months,
    days,
  };
}
