import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { ArrowLeft, Save, Eye, Edit } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import api from "@/utills/api";

export default function AddLead() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

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
      customer_name: "",
      company_name: "",
      email: "",
      mobile_number_1: "",
      mobile_number_2: "",
      interested_product: "",
      country: "",
      state: "",
      city: "",
      notes: "",
      response: "",
      lead_status: "",
    },
    validationSchema: Yup.object({
      customer_name: Yup.string().required("Customer name is required"),
      mobile_number_1: Yup.string()
        .required("Mobile number 1 is required")
        .matches(/^\d{10,}$/, "Enter a valid phone number"),
      interested_product: Yup.string().required("Interest is required"),
      company_name: Yup.string().required("Company name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      country: Yup.string().required("Country is required"),
      state: Yup.string().required("State is required"),
      city: Yup.string().required("City is required"),
      notes: Yup.string().required("Message is required"),
      lead_status: Yup.string()
        .required("Status is required")
        .oneOf(["New", "Contacted", "Lost"], "Invalid status"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      const finalData = {
        ...values,
        country: selectedCountry?.label || values.country,
        state: selectedState?.label || values.state,
        city: selectedCity?.label || values.city,
        mobile_number_2: values.mobile_number_2 || null, // Ensure optional field is null if empty
      };

      try {
        if (leadId) {
          await api.put(`/nodesetup/leads/${leadId}`, finalData, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          });
          toast.success("Lead updated successfully!💚");
        } else {
          await api.post("/nodesetup/leads", finalData, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          });
          toast.success("Lead created successfully!😊");
        }
        router.push("/leads");
      } catch (err) {
        console.error("Error submitting form:", err);
        let errorMsg = "Something went wrong!";
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
          if (err.response.data.data) {
            errorMsg += `: ${err.response.data.data}`;
          }
        } else if (err.message) {
          errorMsg = `Network error: ${err.message}`;
        }
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchLeadData = async () => {
      if (leadId) {
        setLoading(true);
        try {
          const response = await api.get(`/nodesetup/leads/${leadId}`);
          const data = response.data.data || response.data;

          // Set form values
          formik.setValues({
            customer_name: data.customer_name || "",
            company_name: data.company_name || "",
            email: data.email || "",
            mobile_number_1: data.mobile_number_1 || "",
            mobile_number_2: data.mobile_number_2 || "",
            interested_product: data.interested_product || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            notes: data.notes || "",
            response: data.response || "",
            lead_status: data.lead_status || "",
          });
          // Set location dropdowns
          const country = Country.getAllCountries().find(
            (c) => c.name === data.country
          );
          if (country) {
            setSelectedCountry({ value: country.isoCode, label: country.name });
            const state = State.getStatesOfCountry(country.isoCode).find(
              (s) => s.name === data.state
            );
            if (state) {
              setSelectedState({ value: state.isoCode, label: state.name });
              const city = City.getCitiesOfState(
                country.isoCode,
                state.isoCode
              ).find((c) => c.name === data.city);
              if (city) {
                setSelectedCity({ value: city.name, label: city.name });
              }
            }
          }
          // Set follow-ups
          setFollowUps(data.follow_ups || []);
        } catch (error) {
          console.error("Error fetching lead data:", error);
          setErrorMessage("Error loading lead data!");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchLeadData();
  }, [leadId]);

  const toggleViewMode = () => {
    setViewMode(!viewMode);
    setErrorMessage("");
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-16 px-4 sm:px-6 md:px-8'>
        <div className='max-w-6xl mx-auto py-10 flex justify-center items-center'>
          <div className='text-xl text-gray-600 dark:text-gray-300'>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12
     px-4 sm:px-6 md:px-8'>
      <div className='max-w-6xl mx-auto py-10'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white'>
            {leadId ? (viewMode ? "View Lead" : "Edit Lead") : "Add Lead"}
          </h1>
          <div className='flex gap-4'>
            {leadId && (
              <button
                onClick={toggleViewMode}
                className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] cursor-pointer'>
                {viewMode ? (
                  <>
                    <Edit size={18} /> <span>Edit</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} /> <span>View</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => router.push("/leads")}
              className='group flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] cursor-pointer duration-300'>
              <ArrowLeft
                size={18}
                className='group-hover:-translate-x-1 transition-transform duration-300'
              />
              <span>Back</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 rounded-lg'>
            {errorMessage}
          </div>
        )}

        {viewMode && leadId ? (
          <div className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6'>
            <div className='flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700'>
              <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>
                Follow-ups for {formik.values.customer_name}
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  formik.values.lead_status === "New"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : formik.values.lead_status === "Contacted"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                {formik.values.lead_status}
              </span>
            </div>
            <div>
              {followUps && followUps.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-600'>
                    <thead className='bg-gray-100 dark:bg-gray-800'>
                      <tr>
                        <th className='px-4 py-2 text-left'>#</th>
                        <th className='px-4 py-2 text-left'>Message</th>
                        <th className='px-4 py-2 text-left'>Status</th>
                        <th className='px-4 py-2 text-left'>Method</th>
                        <th className='px-4 py-2 text-left'>Sent At</th>
                        <th className='px-4 py-2 text-left'>Response</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 dark:divide-gray-600'>
                      {followUps.map((followUp) => (
                        <tr key={followUp.follow_up_id}>
                          <td className='px-4 py-2'>
                            {followUp.follow_up_number}
                          </td>
                          <td className='px-4 py-2'>{followUp.message}</td>
                          <td className='px-4 py-2'>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                followUp.status === "sent"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : followUp.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {followUp.status}
                            </span>
                          </td>
                          <td className='px-4 py-2'>{followUp.method}</td>
                          <td className='px-4 py-2'>
                            {followUp.sent_at
                              ? new Date(followUp.sent_at).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className='px-4 py-2 text-sm text-gray-800 dark:text-gray-200'>
                            {formik.values.response &&
                            formik.values.response.trim() !== "" ? (
                              formik.values.response
                            ) : (
                              <span className='italic text-gray-400'>
                                No response
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    No follow-ups sent yet
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={formik.handleSubmit}
            className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Customer Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='customer_name'
                {...formik.getFieldProps("customer_name")}
                placeholder='Customer name'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.customer_name && formik.errors.customer_name && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.customer_name}
                </div>
              )}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Mobile Number 1 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='mobile_number_1'
                  {...formik.getFieldProps("mobile_number_1")}
                  placeholder='Phone number'
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                />
                {formik.touched.mobile_number_1 &&
                  formik.errors.mobile_number_1 && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.mobile_number_1}
                    </div>
                  )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Mobile Number 2
                </label>
                <input
                  type='tel'
                  name='mobile_number_2'
                  {...formik.getFieldProps("mobile_number_2")}
                  placeholder='Phone number (optional)'
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Company Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='company_name'
                  {...formik.getFieldProps("company_name")}
                  placeholder='Company name'
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                />
                {formik.touched.company_name && formik.errors.company_name && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.company_name}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Interest / Service <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='interested_product'
                  {...formik.getFieldProps("interested_product")}
                  placeholder='e.g. Website Development'
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                />
                {formik.touched.interested_product &&
                  formik.errors.interested_product && (
                    <div className='text-red-500 text-sm mt-1'>
                      {formik.errors.interested_product}
                    </div>
                  )}
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  {...formik.getFieldProps("email")}
                  placeholder='Customer email'
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                />
                {formik.touched.email && formik.errors.email && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.email}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Lead Status<span className='text-red-500'>*</span>
                </label>
                <select
                  name='lead_status'
                  {...formik.getFieldProps("lead_status")}
                  className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:text-black dark:focus:text-white'>
                  <option value=''>Select Status</option>
                  <option value='New'>New</option>
                  <option value='Contacted'>Contacted</option>
                  <option value='Lost'>Lost</option>
                </select>
                {formik.touched.lead_status && formik.errors.lead_status && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.lead_status}
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-wrap gap-4'>
              <div className='flex-1 min-w-[200px]'>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  Country <span className='text-red-500'>*</span>
                </label>
                <Select
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(option) => {
                    setSelectedCountry(option);
                    setSelectedState(null);
                    setSelectedCity(null);
                    formik.setFieldValue("country", option?.label || "");
                    formik.setFieldValue("state", "");
                    formik.setFieldValue("city", "");
                  }}
                  placeholder='Select Country'
                  className='text-black'
                />
                {formik.touched.country && formik.errors.country && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.country}
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-[200px]'>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  State <span className='text-red-500'>*</span>
                </label>
                <Select
                  options={stateOptions}
                  value={selectedState}
                  onChange={(option) => {
                    setSelectedState(option);
                    setSelectedCity(null);
                    formik.setFieldValue("state", option?.label || "");
                    formik.setFieldValue("city", "");
                  }}
                  isDisabled={!selectedCountry}
                  placeholder='Select State'
                  className='text-black'
                />
                {formik.touched.state && formik.errors.state && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.state}
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-[200px]'>
                <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  City <span className='text-red-500'>*</span>
                </label>
                <Select
                  options={cityOptions}
                  value={selectedCity}
                  onChange={(option) => {
                    setSelectedCity(option);
                    formik.setFieldValue("city", option?.label || "");
                  }}
                  isDisabled={!selectedState}
                  placeholder='Select City'
                  className='text-black'
                />
                {formik.touched.city && formik.errors.city && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.city}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Notes / Message <span className='text-red-500'>*</span>
              </label>
              <textarea
                name='notes'
                rows='4'
                {...formik.getFieldProps("notes")}
                placeholder='Write additional details...'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.notes && formik.errors.notes && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.notes}
                </div>
              )}
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Response{" "}
              </label>
              <textarea
                name='response'
                rows='4'
                {...formik.getFieldProps("response")}
                placeholder='Write additional details...'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
            </div>

            <div className='space-y-4'>
              <p className='text-sm text-gray-500 dark:text-gray-400 '>
                ➡️ All fields marked with
                <span className='text-red-500'> *</span> are mandatory.
              </p>
              <div className='text-right pt-6'>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex items-center mx-auto gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer duration-300'>
                  {" "}
                  <span className='font-semibold'>
                    {loading ? "Processing..." : leadId ? "Update" : "Save"}
                  </span>{" "}
                  <Save size={18} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
