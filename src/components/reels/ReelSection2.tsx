'use client';

import Link from 'next/link';
import React from 'react';

export const ReelSection = () => {
  return (
    <div className="container mx-auto mb-0 px-4 py-4">
      <button
        className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-5 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group"
      >
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"
        ></div>

        <div className="relative flex items-center justify-between">
          {/* Text Content */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sparkles h-6 w-6 text-yellow-300 animate-pulse"
                aria-hidden="true"
              >
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                <path d="M20 2v4" />
                <path d="M22 4h-4" />
                <circle cx="4" cy="20" r="2" />
              </svg>
              <h3 className="text-white text-xl font-bold">فيديوهات المودلز</h3>
            </div>

            <p className="text-white/90 text-[11px] md:text-sm lg:text-sm mb-3">
              شاهد أحدث إطلالات العارضات والمؤثرات
            </p>

            <div className="flex items-center justify-end gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1 text-white/90 text-[11px] md:text-sm lg:text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
                +100 فيديو
              </span>
              <span>•</span>
              <span className="text-white/90 text-[11px] md:text-sm lg:text-sm">تحديث يومي</span>
            </div>
          </div>

          {/* Play Button Circle */}
          <Link href="/style-today">
          <div className="mr-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl animate-pulse"></div>
              <div className="relative h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40 group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play h-10 w-10 text-white fill-white mr-1"
                  aria-hidden="true"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
              </div>
            </div>
          </div>
          </Link>
        </div>
      </button>
    </div>
  );
};