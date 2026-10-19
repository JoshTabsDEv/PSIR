'use client';

import { Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Agency Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/Parole_and_Probation_Administration_(PPA).svg"
                  alt="Parole and Probation Administration logo"
                  width={32}
                  height={32}
                />
                <div>
                  <h3 className="font-semibold text-[var(--brand-primary)] text-sm">
                    PSIR Management System
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bureau of Corrections
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                A comprehensive digital solution for managing Post-Sentence Investigation Reports 
                with efficiency and accuracy.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Official Government System</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-sm">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a 
                    href="/dashboard" 
                    className="text-muted-foreground hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
                  >
                    <span>Dashboard</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/dashboard/analytics" 
                    className="text-muted-foreground hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
                  >
                    <span>Analytics</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/dashboard/reports" 
                    className="text-muted-foreground hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
                  >
                    <span>All Reports</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/reports/new" 
                    className="text-muted-foreground hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
                  >
                    <span>New Investigation</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground text-sm">Contact Information</h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-muted-foreground">
                    <p>Department of Justice</p>
                    <p>Bureau of Corrections</p>
                    <p>Parole and Probation Administration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <a 
                    href="mailto:info@bureau.of.gov.ph" 
                    className="text-muted-foreground hover:text-[var(--brand-primary)] transition-colors"
                  >
                    info@bureau.of.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">+63 (2) 1234-5678</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>&copy; {currentYear} Bureau of Corrections</span>
              <span>&bull;</span>
              <span>All rights reserved</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
              >
                <span>Privacy Policy</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="#" 
                className="hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
              >
                <span>Terms of Service</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="#" 
                className="hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
              >
                <span>System Guidelines</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
