import Image from "next/image";
import Link from "next/link";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="w-full sm:max-w-md">
        <div className="m-2 flex justify-center">
          <Link href={"/"} className="flex gap-2">
            <Image alt="logo" src={"logo.svg"} width={25} height={25} />
            <div className="text-lg font-bold">AutoNode</div>
          </Link>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
