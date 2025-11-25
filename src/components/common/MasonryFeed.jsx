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
                        className="mb-4 break-inside-avoid cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        <Link to={`/image/${item.id}`}>
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full object-cover rounded-xl"
                            />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
