import CompanyComponent from '@/components/company/company';
import steps from '@/components/layouts/tour/steps-login';
import AuthProvider from '@/services/auth-provider';
import { TourProvider } from '@reactour/tour';
import "../../../app/globals.css";

const CompanyPage = () => {
  const radius = 10;
  return (
    <AuthProvider>
      <TourProvider steps={steps}
        badgeContent={({ totalSteps, currentStep }) => currentStep + 1 + "/" + totalSteps}
        styles={{
          popover: (base) => ({
            ...base,
            '--reactour-accent': '#0099ff',
            borderRadius: radius,
          }),
          maskArea: (base) => ({ ...base, rx: radius }),
          maskWrapper: (base) => ({ ...base, color: '#0099ff' }),
          badge: (base) => ({ ...base, left: 'auto', right: '-0.8125em' }),
          controls: (base) => ({ ...base, marginTop: 20 }),
          close: (base) => ({ ...base, right: 'auto', left: 8, top: 8 }),
        }}
      >
        <main className="flex min-h-screen flex-col items-center justify-between p-6 mb-14">
          <CompanyComponent />
        </main>
      </TourProvider>
    </AuthProvider>
  );
};

export default CompanyPage;