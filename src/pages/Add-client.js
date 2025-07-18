import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "@/utills/api";
import { toast } from "react-toastify";

export default function AddClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((s) => ({
        value: s.isoCode,
        label: s.name,
      }))
    : [];

  const cityOptions = selectedState
    ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
        (c) => ({
          value: c.name,
          label: c.name,
        })
      )
    : [];

  const formik = useFormik({
    initialValues: {
      company_name: "",
      address: "",
      country: "",
      state: "",
      city: "",
      email: "",
      mobile_number_1: "",
      mobile_number_2: "",
      plan_purchased: "",
      plan_start_date: "",
      plan_end_date: "",
    },
    validationSchema: Yup.object({
      company_name: Yup.string().required("Name is required"),
      address: Yup.string().required("Address is required"),
      country: Yup.string().required("Country is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      mobile_number_1: Yup.string()
        .matches(/^[0-9]{10}$/, "Mobile No1 must be 10 digits")
        .required("Mobile No1 is required"),
      mobile_number_2: Yup.string()
        .matches(/^[0-9]{10}$/, "Mobile No1 must be 10 digits")
        .required("Mobile No2 is required"),
      plan_purchased: Yup.string().required("Plan is required"),
      plan_start_date: Yup.date().required("Start date is required"),
      plan_end_date: Yup.date()
        .required("End date is required")
        .min(Yup.ref("plan_start_date"), "End date must be after start date"),
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        if (clientId) {
          // PUT request for update
          await api.put(`/nodesetup/customers/${clientId}`, values);
          toast.success("Client updated successfully! 💚");
        } else {
          // POST request for new client
          await api.post("/nodesetup/customers", values);
          toast.success("Client added successfully! 😊");
        }
        router.push("/existingclient");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to submit. Please try again. 🤔"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch client data if editing
  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      api
        .get(`/nodesetup/customers/${clientId}`)
        .then((res) => {
          const data = res?.data?.data;
          formik.setValues({
            company_name: data?.company_name || "",
            address: data?.address || "",
            country: data?.country || "",
            state: data?.state || "",
            city: data?.city || "",
            email: data?.email || "",
            mobile_number_1: data?.mobile_number_1 || "",
            mobile_number_2: data?.mobile_number_2 || "",
            plan_purchased: data?.plan_purchased || "",
            plan_start_date: data?.plan_start_date?.split("T")[0] || "",
            plan_end_date: data?.plan_end_date?.split("T")[0] || "",
          });

          const matchedCountry = countryOptions.find(
            (c) => c.label === data.country
          );
          const matchedState =
            matchedCountry &&
            State.getStatesOfCountry(matchedCountry.value).find(
              (s) => s.name === data.state
            );
          const matchedCity =
            matchedState &&
            City.getCitiesOfState(
              matchedCountry.value,
              matchedState.isoCode
            ).find((c) => c.name === data.city);

          setSelectedCountry(
            matchedCountry
              ? { value: matchedCountry.value, label: matchedCountry.label }
              : null
          );
          setSelectedState(
            matchedState
              ? { value: matchedState.isoCode, label: matchedState.name }
              : null
          );
          setSelectedCity(
            matchedCity
              ? { value: matchedCity.name, label: matchedCity.name }
              : null
          );
        })
        .catch((err) => {
          console.error("Failed to fetch client data:", err);
          toast.error("Failed to fetch client data. ❌");
        })
        .finally(() => setIsLoading(false));
    }
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl font-semibold text-gray-700 dark:text-white">
        Loading client data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
            {clientId ? "Edit Client" : "Add Client"}
          </h1>
          <button
            onClick={() => router.push("/existingclient")}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg group cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span className="font-semibold">Back</span>
          </button>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formik.values.company_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter full name"
              className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
            />
            {formik.touched.company_name && formik.errors.company_name && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.company_name}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter address"
              className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.address}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(option) => {
                  setSelectedCountry(option);
                  setSelectedState(null);
                  setSelectedCity(null);
                  formik.setFieldValue("country", option?.label || "");
                }}
                placeholder="Select Country"
                className="text-black"
              />
              {formik.touched.country && formik.errors.country && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.country}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <Select
                options={stateOptions}
                value={selectedState}
                onChange={(option) => {
                  setSelectedState(option);
                  setSelectedCity(null);
                  formik.setFieldValue("state", option?.label || "");
                }}
                isDisabled={!selectedCountry}
                placeholder="Select State"
                className="text-black"
              />
              {formik.touched.state && formik.errors.state && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.state}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <Select
                options={cityOptions}
                value={selectedCity}
                onChange={(option) => {
                  setSelectedCity(option);
                  formik.setFieldValue("city", option?.label || "");
                }}
                isDisabled={!selectedState}
                placeholder="Select City"
                className="text-black"
              />
              {formik.touched.city && formik.errors.city && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.city}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number_1"
                value={formik.values.mobile_number_1}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter primary mobileno"
                className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.mobile_number_1 &&
                formik.errors.mobile_number_1 && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.mobile_number_1}
                  </div>
                )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number 2 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number_2"
                value={formik.values.mobile_number_2}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter secondary mobileno"
                className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.mobile_number_2 &&
                formik.errors.mobile_number_2 && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.mobile_number_2}
                  </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email address"
                className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plan_purchased"
                value={formik.values.plan_purchased}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Plan"
                className="w-full px-4 py-3 rounded-xl border border-black bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              />
              {formik.touched.plan_purchased &&
                formik.errors.plan_purchased && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.plan_purchased}
                  </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["plan_start_date", "plan_end_date"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {field === "plan_start_date" ? "Start Date" : "End Date"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name={field}
                  value={formik.values[field]}
                  onChange={formik.handleChange}
                  min={
                    field === "plan_end_date"
                      ? formik.values.plan_start_date
                      : undefined
                  }
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
                />
                {formik.touched[field] && formik.errors[field] && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors[field]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 ">
              ➡️ All fields marked with
              <span className="text-red-500"> *</span> are mandatory.
            </p>
            <div className="text-right pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center mx-auto gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <span className="font-semibold">
                  {isSubmitting
                    ? "Processing..."
                    : clientId
                    ? "Update"
                    : "Save"}
                </span>
                {!isSubmitting && <Save size={18} />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
