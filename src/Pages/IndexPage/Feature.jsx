function Feature({ photo, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <img src={`/img/IndexPage/${photo}`} alt={title} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-text">{text}</p>
    </div>
  );
}

export default Feature;