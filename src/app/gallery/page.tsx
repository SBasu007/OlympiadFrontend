import Image from "next/image";
import Navbar from "../components/Navbar";

type GalleryImage = {
	src: string;
	alt: string;
};

const galleryImages: GalleryImage[] = [
	{ src: "/gallery/g1.png", alt: "Gallery photo 1" },
	{ src: "/gallery/g2.png", alt: "Gallery photo 2" }
];

export default function GalleryPage() {
	return (
		<>
			<Navbar />
			<div className="h-16" aria-hidden="true" />
			<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
				<section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
						<p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
							Event Highlights
						</p>
						<h1 className="mt-2 text-center text-3xl font-bold text-[#253b70] sm:text-4xl">
							Photo Gallery
						</h1>
					</div>

					<section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{galleryImages.map((image) => (
							<article
								key={image.src}
								className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
							>
								<div className="relative aspect-[4/3] w-full bg-gray-100">
									<Image
										src={image.src}
										alt={image.alt}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
										className="object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
								<div className="flex items-center justify-between px-3 py-2.5">
									<p className="text-xs font-medium text-gray-600">{image.alt}</p>
									<span className="h-2 w-2 rounded-full bg-orange-400" />
								</div>
							</article>
						))}
					</section>
				</section>
			</main>
		</>
	);
}
