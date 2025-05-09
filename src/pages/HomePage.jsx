import React, { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import LogoWithText from "../pages/LogoWithText";

// Import instrument images
import drumsImg from "../assets/photos/drums.png";
import fluteImg from "../assets/photos/flute.png";
import guitarImg from "../assets/photos/guitar.png";
import tablaImg from "../assets/photos/tabla.png";
import harmoniumImg from "../assets/photos/harmonium.png";
import saxophoneImg from "../assets/photos/saxophone.png";
import keyboardImg from "../assets/photos/keyboard.png";
import violinImg from "../assets/photos/violin.png";

// Array of instruments with images and virtual instrument links
const instruments = [
  {
    name: "drums",
    image: drumsImg,
    virtualLink:
      "https://www.sessiontown.com/en/music-games-apps/virtual-instrument-play-drums-online",
  },
  {
    name: "flute",
    image: fluteImg,
    virtualLink: "https://www.virtualmusicalinstruments.com/flute",
  },
  {
    name: "guitar",
    image: guitarImg,
    virtualLink: "https://www.musicca.com/guitar",
  },
  {
    name: "tabla",
    image: tablaImg,
    virtualLink: "https://artiumacademy.com/tools/tabla",
  },
  {
    name: "harmonium",
    image: harmoniumImg,
    virtualLink: "https://music-tools.spardhaschoolofmusic.com/harmonium",
  },
  {
    name: "saxophone",
    image: saxophoneImg,
    virtualLink: "https://www.trumpetfingering.com/virtual-saxophone",
  },
  {
    name: "keyboard",
    image: keyboardImg,
    virtualLink:
      "https://www.sessiontown.com/en/music-games-apps/online-virtual-keyboard-piano",
  },
  {
    name: "violin",
    image: violinImg,
    virtualLink:
      "https://www.ecarddesignanimation.com/home/violin_html5.php",
  },
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

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-yellow-50 via-pink-100 to-purple-200 font-sans">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex justify-between items-center mb-10 opacity-0 -translate-y-10 w-full"
      >
        {/* Logo Section */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <LogoWithText />
        </div>

        {/* Button Section for Desktop */}
        <div className="hidden sm:flex gap-4 flex-wrap justify-end items-center">
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

      {/* Button Section for Mobile */}
      <div className="flex gap-4 flex-wrap justify-center mb-6 sm:hidden">
        <button
          onClick={() => navigate("/add-resource")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition w-full sm:w-auto mb-2 sm:mb-0"
        >
          + Add Resource
        </button>
        <button
          onClick={() => navigate("/manage-resources")}
          className="bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-medium px-4 py-2 rounded-lg shadow w-full sm:w-auto mb-2 sm:mb-0"
        >
          Manage Resources
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="bg-white border border-purple-600 text-purple-700 hover:bg-purple-50 font-medium px-4 py-2 rounded-lg shadow w-full sm:w-auto"
        >
          Profile
        </button>
      </div>

      {/* Instrument Grid */}
      <div>
        <h2 className="text-3xl font-extrabold text-purple-700 mb-6">
          🎵 Choose Your Instrument
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {instruments.map((instrument, index) => (
            <div
              key={instrument.name}
              ref={(el) => (cardRefs.current[index] = el)}
              className="opacity-0 translate-y-6 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => navigate(`/instrument/${instrument.name}`)}
            >
              <div className="bg-purple-100 h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center rounded-t-2xl overflow-hidden">
                <img
                  src={instrument.image}
                  alt={instrument.name}
                  className="h-full object-contain p-4"
                />
              </div>
              <div className="p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold capitalize text-gray-800 mb-2">
                  {instrument.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore resources and start learning
                </p>
                <button
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-all mb-2"
                  onClick={() => navigate(`/instrument/${instrument.name}`)}
                >
                  Start Learning
                </button>
                <button
                  className="w-full bg-white text-purple-700 border border-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition-all"
                  onClick={() => window.open(instrument.virtualLink, "_blank")}
                >
                  Virtual Instrument
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
