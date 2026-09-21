'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';

export interface LinkProps {
  href: string;
  to?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Link: React.FC<LinkProps> = ({ to, href, children, ...props }) => {
  const targetHref = href || to || '/';
  return (
    <NextLink href={targetHref} {...props}>
      {children}
    </NextLink>
  );
};

export const useNavigate = () => {
  const router = useNextRouter();
  return (to: string | number) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      router.push(String(to));
    }
  };
};

export const useLocation = () => {
  const pathname = usePathname();
  let search = '';
  
  try {
    // useSearchParams faqat Suspense ichida xavfsiz ishlaydi, 
    // shuning uchun uni try-catch bilan orab, build paytida qulab tushishining oldini olamiz
    const searchParams = useSearchParams();
    search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  } catch {
    // SSR / Prerender vaqtida Suspense bo'lmasa, xatoni yutib yuboradi
    search = '';
  }

  return {
    pathname: pathname || '/',
    search,
  };
};