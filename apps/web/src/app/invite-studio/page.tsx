'use client';

import React from 'react';

export default function InviteStudioPage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#faf7f2]">
      <iframe
        src="/invite-studio/index.html"
        title="Grand Bandhan Invite Studio"
        className="w-full h-full border-0 select-none"
        allow="clipboard-write; autoplay"
      />
    </div>
  );
}
