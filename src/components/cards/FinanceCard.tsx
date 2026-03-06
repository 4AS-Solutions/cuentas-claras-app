"use client";

import Tilt from "react-parallax-tilt";

type Props = {
  name: string;
  brand: string;
  last4: string | null;
  color: string | null;
};

export default function FinanceCard({
  name,
  brand,
  last4,
  color
}: Props) {

  return (

    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      glareEnable
      glareMaxOpacity={0.25}
      scale={1.05}
      transitionSpeed={1200}
      className="rounded-2xl"
    >

      <div
        className="relative rounded-2xl p-6 text-white shadow-xl overflow-hidden h-[180px]"
        style={{
          background: `linear-gradient(135deg, ${color}, #111827)`
        }}
      >

        {/* LIGHT EFFECT */}

        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

        {/* CHIP */}

        <div className="absolute top-5 right-5 w-11 h-8 bg-yellow-400 rounded-md shadow-inner" />

        {/* BANK */}

        <div>

          <p className="text-lg font-semibold">
            {name}
          </p>

          <p className="text-xs opacity-80 mt-1 uppercase tracking-widest">
            {brand === "credit"
              ? "Credit Card"
              : "Debit Card"}
          </p>

        </div>

        {/* CARD NUMBER */}

        <p className="mt-12 text-xl tracking-widest font-medium">

          {last4
            ? `•••• ${last4}`
            : "•••• •••• •••• ••••"}

        </p>

        {/* BRAND */}

        <div className="absolute bottom-4 right-5 text-xs opacity-70 uppercase tracking-widest">

          {brand}

        </div>

      </div>

    </Tilt>
  );
}