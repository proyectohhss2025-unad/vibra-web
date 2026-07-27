import { FULL_DESCRIPTION, FULL_NAME, FULL_TAG } from '../../utils/constants';

const ErrorPage = () => {
  return (
    <div className="author-photo-container">
      <img
        src="https://avatars.githubusercontent.com/u/5626034?v=4"
        alt={FULL_NAME}
        width={800}
        height={500}
        className="img-fluid"
      />
      <div className="author-info">
        <h2>{FULL_NAME}</h2>
        <p>{FULL_TAG}</p>
        <p>{FULL_DESCRIPTION}</p>
      </div>
    </div>
  );
};

export default ErrorPage;   
