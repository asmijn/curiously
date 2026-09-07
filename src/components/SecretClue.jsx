import { Link } from "react-router-dom";

export default function SecretClue({
  to,
  symbol = "✦",
  label = "A CURIOUS LITTLE SECRET",
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`secret-clue ${className}`}
      aria-label={label}
      title={label}
    >
      {symbol}
    </Link>
  );
}