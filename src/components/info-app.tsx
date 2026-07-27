import '../styles/info-app.css';
import { FULL_NAME } from '../utils/constants';

const InfoApp = () => {
  return (
    <div className="flex align-items justify-center mt-0 px-4 mb-4">
      <img
        className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
        src="/logo.svg"
        alt={FULL_NAME}
        width={400}
        height={300}
      />
    </div>
  );
};

export default InfoApp;   
