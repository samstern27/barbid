"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  LinkIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { getDatabase, ref, set } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

export default function CreateBusiness({
  createBusinessOpen,
  setCreateBusinessOpen,
}) {
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [type, setType] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [businessId, setBusinessId] = useState(uuidv4());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      setError("Business name is required");
      return;
    }

    if (!currentUser?.uid) {
      setError("You must be logged in to create a business");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Get coordinates from address
      console.log("Making API call to Google Geocoding...");

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address
        .split(" ")
        .join("+")},+${
        city.includes(" ") ? city.split(" ").join("+") : city
      },+${
        postcode.includes(" ") ? postcode.split(" ").join("+") : postcode
      }&key=${import.meta.env.VITE_GEOCODING_API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error: Status ${res.status}`);
      }

      const geoData = await res.json();
      console.log(geoData);

      // Extract coordinates from Google Geocoding API response
      let fetchedCoords = null;
      if (geoData.results && geoData.results.length > 0) {
        const location = geoData.results[0].geometry.location;
        fetchedCoords = {
          lat: location.lat,
          lng: location.lng,
        };
      }

      const db = getDatabase();
      const userId = currentUser.uid;
      const userBusinessRef = ref(
        db,
        "users/" + userId + "/business/" + businessId
      );

      await set(userBusinessRef, {
        name: name,
        phone: phone,
        description: description,
        address: address,
        city: city,
        postcode: postcode,
        type: type,
        privacy: privacy,
        jobListings: 0,
        jobs: [],
        businessId: businessId,
        coords: fetchedCoords, // Add coordinates to the business data
        createdAt: new Date().toISOString(),
      });

      setCreateBusinessOpen(false);

      // Reset form
      setName("");
      setPhone("");
      setDescription("");
      setAddress("");
      setCity("");
      setPostcode("");
      setType(null);
      setPrivacy("public");
      setBusinessId("");
    } catch (error) {
      console.error("Error creating business:", error);
      setError("Failed to create business. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog
        open={createBusinessOpen}
        onClose={setCreateBusinessOpen}
        className="relative z-10"
      >
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16"
              style={{ top: "64px" }}
            >
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form
                  className="flex h-full flex-col overflow-y-auto bg-white shadow-xl"
                  onSubmit={handleSubmit}
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <DialogTitle className="text-base font-semibold text-gray-900">
                            New Business
                          </DialogTitle>
                          <p className="text-sm text-gray-500">
                            Get started by filling in the information below to
                            create your new business.
                          </p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setCreateBusinessOpen(false)}
                            className="relative text-gray-400 hover:text-gray-500"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error display */}
                    {error && (
                      <div className="px-4 py-3 sm:px-6">
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{error}</div>
                        </div>
                      </div>
                    )}

                    {/* Divider container */}
                    <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                      {/* Business name */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-name"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Business name
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="business-name"
                            name="business-name"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-phone"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Contact number
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="business-phone"
                            name="business-phone"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Business description */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-description"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Description
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            id="business-description"
                            name="business-description"
                            rows={3}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Type */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label
                            htmlFor="type"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Type
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <select
                              id="type"
                              name="type"
                              className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              defaultValue={type || ""}
                              onChange={(e) => setType(e.target.value)}
                            >
                              <option value="" disabled>
                                Select a type
                              </option>
                              <option value="Pub">Pub</option>
                              <option value="Bar">Bar</option>
                              <option value="Cafe">Cafe</option>
                              <option value="Restaurant">Restaurant</option>
                              <option value="Nightclub">Nightclub</option>
                              <option value="Hotel">Hotel</option>
                              <option value="Shop">Shop</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500 sm:size-4"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Address */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-address"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Address
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="business-address"
                            name="business-address"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-city"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            City/Town
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="business-city"
                            name="business-city"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Postcode */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="business-postcode"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Postcode
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            id="business-postcode"
                            name="business-postcode"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Privacy */}
                      <fieldset className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <legend className="sr-only">Privacy</legend>
                        <div
                          aria-hidden="true"
                          className="text-sm/6 font-medium text-gray-900"
                        >
                          Privacy
                        </div>
                        <div className="space-y-5 sm:col-span-2">
                          <div className="space-y-5 sm:mt-0">
                            <div className="relative flex items-start">
                              <div className="absolute flex h-6 items-center">
                                <input
                                  value="public"
                                  defaultChecked
                                  id="privacy-public"
                                  name="privacy"
                                  type="radio"
                                  onChange={() => setPrivacy("public")}
                                  aria-describedby="privacy-public-description"
                                  className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                                />
                              </div>
                              <div className="pl-7 text-sm/6">
                                <label
                                  htmlFor="privacy-public"
                                  className="font-medium text-gray-900"
                                >
                                  Public access
                                </label>
                                <p
                                  id="privacy-public-description"
                                  className="text-gray-500"
                                >
                                  Everyone will be able to see this business.
                                </p>
                              </div>
                            </div>

                            <div className="relative flex items-start">
                              <div className="absolute flex h-6 items-center">
                                <input
                                  value="private"
                                  id="privacy-private"
                                  name="privacy"
                                  type="radio"
                                  onChange={() => setPrivacy("private")}
                                  aria-describedby="privacy-private-to-project-description"
                                  className="relative size-4 appearance-none rounded-full border border-gray-300 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                                />
                              </div>
                              <div className="pl-7 text-sm/6">
                                <label
                                  htmlFor="privacy-private"
                                  className="font-medium text-gray-900"
                                >
                                  Private to you
                                </label>
                                <p
                                  id="privacy-private-description"
                                  className="text-gray-500"
                                >
                                  You are the only one able to view this
                                  business.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setCreateBusinessOpen(false)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
