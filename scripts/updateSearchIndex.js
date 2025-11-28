import { db } from "./firebaseAdmin.js";

function buildSearchIndex(title, description, tags) {
    const words = [
        ...title.toLowerCase().split(" "),
        ...description.toLowerCase().split(" "),
        ...(Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : []),
    ];
    return [...new Set(words.filter(Boolean))];
}

async function updateSearchIndex() {
    console.log("🔄 Updating search index for existing artworks...");

    const imagesSnapshot = await db.collection("artworks").get();

    if (imagesSnapshot.empty) {
        console.log("⚠️ No artworks found.");
        return;
    }

    let count = 0;

    for (const doc of imagesSnapshot.docs) {
        const data = doc.data();

        const searchIndex = buildSearchIndex(
            data.title || "",
            data.description || "",
            data.tags || []
        );

        // Update artwork document with searchIndex array
        await db.collection("artworks").doc(doc.id).update({ searchIndex });

        count++;
    }

    console.log(`✅ Search index updated for ${count} artworks.`);
}

updateSearchIndex().catch((err) => {
    console.error("❌ Error updating search index:", err);
});
