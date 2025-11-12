import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
    default: 6,
    1024: 3,
    768: 2,
    480: 1,
};

export default function MasonryFeed({ items }) {
    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-full gap-4"
            columnClassName="masonry-column"
        >
            {items.map((item, index) => (
                <div key={index} className="mb-4 break-inside-avoid">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="rounded-lg w-full"
                    />
                    <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--color-rich-black)" }}
                    >
                        {item.title}
                    </p>
                </div>
            ))}
        </Masonry>
    );
}
