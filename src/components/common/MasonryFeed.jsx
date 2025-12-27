import { Link } from "react-router-dom";

export default function MasonryFeed({ items = [] }) {
    return (
        <div className="w-full px-4">
            <div
                className="
                    columns-1
                    sm:columns-2
                    md:columns-3
                    lg:columns-4
                    xl:columns-5
                    gap-4
                "
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="mb-4 break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-105 transition-all"
                    >
                        <Link
                            to={`/image/${item.id}`}
                            className="group relative block"
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                loading="lazy"
                                className="w-full object-cover rounded-xl"
                            />
                            {/* Overlay with title */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity"
                                style={{
                                    backgroundColor: "hsla(0, 0%, 0%, 0.4)",
                                }}
                            >
                                <span className="text-white font-semibold text-center px-2">
                                    {item.title}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
