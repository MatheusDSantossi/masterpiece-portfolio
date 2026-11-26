import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap phero nf" data-scene="4">
      <span className="label shadow">404</span>
      <h1 className="shadow" style={{ fontSize: "clamp(44px,7.4vw,104px)" }}>
        Nothing hangs <em>here.</em>
      </h1>
      <div className="btns">
        <Link className="btn pri" href="/">
          Back to the portfolio
        </Link>
        <Link className="btn sec" href="/projects">
          See all projects
        </Link>
      </div>
    </div>
  );
}
