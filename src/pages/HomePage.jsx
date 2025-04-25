import React, { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMusicalNote } from "react-icons/hi2";
import gsap from "gsap";

const instruments = [
  "drums",
  "flute",
  "guitar",
  "tabla",
  "harmonium",
  "saxophone",
  "keyboard",
  "violin",
];

const HomePage = () => {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to(cardRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    });

    return () => ctx.revert(); // Clean up on unmount
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-yellow-50 via-pink-100 to-purple-200 font-sans">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex justify-between items-center mb-10 opacity-0 -translate-y-10"
      >
        <div className="flex items-center text-purple-800 drop-shadow-md">
          <HiOutlineMusicalNote className="text-4xl mr-2 animate-pulse" />
          <h1 className="text-3xl font-extrabold tracking-wide">InstruMentor</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/add-resource")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            + Add Resource
          </button>
          <button
            onClick={() => navigate("/manage-resources")}
            className="bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-medium px-4 py-2 rounded-lg shadow"
          >
            Manage Resources
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-medium px-4 py-2 rounded-lg shadow"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Instrument Grid */}
      <div>
        <h2 className="text-3xl font-extrabold text-purple-700 mb-6">
          🎵 Choose Your Instrument
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instruments.map((instrument, index) => (
            <div
              key={instrument}
              ref={(el) => (cardRefs.current[index] = el)}
              className="opacity-0 translate-y-6 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => navigate(`/instrument/${instrument}`)}
            >
              <div className="bg-purple-100 h-40 flex items-center justify-center rounded-t-2xl">
                <HiOutlineMusicalNote className="text-6xl text-purple-300" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold capitalize text-gray-800 mb-2">
                  {instrument}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore resources and start learning
                </p>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-all">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
