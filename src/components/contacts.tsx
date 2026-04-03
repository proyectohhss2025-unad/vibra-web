import Image from 'next/image';
import { FULL_NAME, FULL_TAG } from '../utils/constants';

const ContactComponent = () => {
  return (
    <div className="author-photo-container">
      <Image src="https://avatars.githubusercontent.com/u/5626034?v=4" alt={FULL_NAME} className="img-fluid"
      />
      <div className="author-info">
        <h2>{FULL_NAME}</h2>
        <p>{FULL_TAG}</p>
      </div>
    </div>
  );
};

export default ContactComponent;
