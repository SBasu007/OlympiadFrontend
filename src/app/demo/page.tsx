"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface DemoQuestion {
	id: number;
	question: string;
	options: string[];
	correctOption: string;
}

interface DemoQuestionStatus {
	answered: boolean;
	markedForReview: boolean;
	selectedOption: string | null;
}

const DEMO_DURATION_SECONDS = 7 * 60;

const DEMO_QUESTIONS: DemoQuestion[] = [
	{
		id: 1,
		question: "What is the value of 7 x 8?",
		options: ["54", "56", "58", "64"],
		correctOption: "56",
	},
	{
		id: 2,
		question: "Which planet is known as the Red Planet?",
		options: ["Venus", "Mars", "Jupiter", "Saturn"],
		correctOption: "Mars",
	},
	{
		id: 3,
		question: "Who wrote the national anthem of India?",
		options: [
			"Bankim Chandra Chattopadhyay",
			"Rabindranath Tagore",
			"Sarojini Naidu",
			"Subramania Bharati",
		],
		correctOption: "Rabindranath Tagore",
	},
	{
		id: 4,
		question: "Which gas do plants absorb from the atmosphere?",
		options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"],
		correctOption: "Carbon Dioxide",
	},
	{
		id: 5,
		question: "What is the next prime number after 11?",
		options: ["12", "13", "15", "17"],
		correctOption: "13",
	},
	{
		id: 6,
		question: "Which is the largest ocean on Earth?",
		options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
		correctOption: "Pacific Ocean",
	},
	{
		id: 7,
		question: "How many sides does a hexagon have?",
		options: ["5", "6", "7", "8"],
		correctOption: "6",
	},
	{
		id: 8,
		question: "Which instrument is used to measure temperature?",
		options: ["Barometer", "Thermometer", "Hygrometer", "Altimeter"],
		correctOption: "Thermometer",
	},
	{
		id: 9,
		question: "What is the capital city of Japan?",
		options: ["Kyoto", "Seoul", "Tokyo", "Osaka"],
		correctOption: "Tokyo",
	},
	{
		id: 10,
		question: "Which number is a perfect square?",
		options: ["18", "27", "36", "45"],
		correctOption: "36",
	},
];

export default function DemoQuizPage() {
	const router = useRouter();

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [questionStatuses, setQuestionStatuses] = useState<
		Record<number, DemoQuestionStatus>
	>({});
	const [timeRemaining, setTimeRemaining] = useState(DEMO_DURATION_SECONDS);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const initialStatuses: Record<number, DemoQuestionStatus> = {};
		DEMO_QUESTIONS.forEach((q) => {
			initialStatuses[q.id] = {
				answered: false,
				markedForReview: false,
				selectedOption: null,
			};
		});
		setQuestionStatuses(initialStatuses);
	}, []);

	useEffect(() => {
		if (timeRemaining <= 0 || submitting) return;

		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timeRemaining, submitting]);

	useEffect(() => {
		if (timeRemaining === 0 && !submitting) {
			handleSubmit(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeRemaining]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];

	const answeredCount = useMemo(
		() => Object.values(questionStatuses).filter((s) => s.answered).length,
		[questionStatuses]
	);

	const reviewCount = useMemo(
		() => Object.values(questionStatuses).filter((s) => s.markedForReview).length,
		[questionStatuses]
	);

	const handleOptionSelect = (option: string) => {
		setQuestionStatuses((prev) => ({
			...prev,
			[currentQuestion.id]: {
				...prev[currentQuestion.id],
				selectedOption: option,
			},
		}));
	};

	const handleSaveAndNext = () => {
		const selectedOption = questionStatuses[currentQuestion.id]?.selectedOption;
		if (!selectedOption) {
			alert("Please select an option before saving.");
			return;
		}

		setQuestionStatuses((prev) => ({
			...prev,
			[currentQuestion.id]: {
				...prev[currentQuestion.id],
				answered: true,
				markedForReview: false,
			},
		}));

		if (currentQuestionIndex < DEMO_QUESTIONS.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	};

	const handleMarkForReview = () => {
		setQuestionStatuses((prev) => ({
			...prev,
			[currentQuestion.id]: {
				...prev[currentQuestion.id],
				markedForReview: !prev[currentQuestion.id]?.markedForReview,
			},
		}));
	};

	const handleSubmit = (isAutoSubmit = false) => {
		if (!isAutoSubmit && !window.confirm("Are you sure you want to submit the demo quiz?")) {
			return;
		}

		setSubmitting(true);

		let score = 0;
		DEMO_QUESTIONS.forEach((q) => {
			const selected = questionStatuses[q.id]?.selectedOption;
			if (selected === q.correctOption) {
				score += 1;
			}
		});

		const total = DEMO_QUESTIONS.length;
		const attempted = Object.values(questionStatuses).filter((s) => s.selectedOption).length;
		const timeTaken = DEMO_DURATION_SECONDS - timeRemaining;

		router.push(
			`/demo/result?score=${score}&total=${total}&attempted=${attempted}&timeTaken=${timeTaken}`
		);
	};

	const getQuestionBoxColor = (questionId: number) => {
		const status = questionStatuses[questionId];
		if (!status) return "bg-gray-300 text-gray-700";
		if (status.markedForReview) return "bg-yellow-400 text-white";
		if (status.answered) return "bg-green-500 text-white";
		if (status.selectedOption) return "bg-blue-500 text-white";
		return "bg-gray-300 text-gray-700";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-xl font-bold text-gray-900">Demo Quiz</h1>
							<p className="text-sm text-gray-600">
								Question {currentQuestionIndex + 1} of {DEMO_QUESTIONS.length}
							</p>
						</div>
						<div
							className={`px-5 py-2 rounded-lg font-mono text-xl font-bold ${
								timeRemaining < 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
							}`}
						>
							{formatTime(timeRemaining)}
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					<div className="lg:col-span-8">
						<div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
							<div className="mb-6">
								<div className="flex items-start gap-3 mb-4">
									<span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
										{currentQuestionIndex + 1}
									</span>
									<p className="text-lg font-medium text-gray-900 flex-1">
										{currentQuestion.question}
									</p>
								</div>
							</div>

							<div className="space-y-3 mb-8">
								{currentQuestion.options.map((option, index) => {
									const isSelected =
										questionStatuses[currentQuestion.id]?.selectedOption === option;

									return (
										<button
											key={index}
											onClick={() => handleOptionSelect(option)}
											className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
												isSelected
													? "border-blue-600 bg-blue-50 shadow-md"
													: "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center gap-3">
												<span
													className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
														isSelected
															? "border-blue-600 bg-blue-600 text-white"
															: "border-gray-300 text-gray-600"
													}`}
												>
													{String.fromCharCode(65 + index)}
												</span>
												<span
													className={`text-base ${
														isSelected ? "text-blue-900 font-medium" : "text-gray-700"
													}`}
												>
													{option}
												</span>
											</div>
										</button>
									);
								})}
							</div>

							<div className="flex flex-wrap gap-3">
								<button
									onClick={handleMarkForReview}
									className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
										questionStatuses[currentQuestion.id]?.markedForReview
											? "bg-yellow-500 text-white hover:bg-yellow-600"
											: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
									}`}
								>
									{questionStatuses[currentQuestion.id]?.markedForReview
										? "Marked"
										: "Mark for Review"}
								</button>

								<button
									onClick={handleSaveAndNext}
									className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
								>
									Save & Next
								</button>

								<button
									onClick={() =>
										setCurrentQuestionIndex((prev) =>
											prev < DEMO_QUESTIONS.length - 1 ? prev + 1 : prev
										)
									}
									className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
								>
									Next
								</button>

								{currentQuestionIndex > 0 && (
									<button
										onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
										className="px-6 py-2.5 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
									>
										Previous
									</button>
								)}
							</div>

							<div className="mt-6 pt-6 border-t border-gray-200">
								<button
									onClick={() => handleSubmit(false)}
									disabled={submitting}
									className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{submitting ? "Submitting..." : "Finish Demo Quiz"}
								</button>
							</div>
						</div>
					</div>

					<div className="lg:col-span-4">
						<div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
							<h3 className="text-lg font-bold text-gray-900 mb-4">Question Palette</h3>

							<div className="mb-4 space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<span className="w-6 h-6 bg-green-500 rounded"></span>
									<span className="text-gray-700">Answered</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-6 h-6 bg-blue-500 rounded"></span>
									<span className="text-gray-700">Selected (Not Saved)</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-6 h-6 bg-yellow-400 rounded"></span>
									<span className="text-gray-700">Marked for Review</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-6 h-6 bg-gray-300 rounded"></span>
									<span className="text-gray-700">Not Attempted</span>
								</div>
							</div>

							<div className="grid grid-cols-5 gap-2">
								{DEMO_QUESTIONS.map((question, index) => (
									<button
										key={question.id}
										onClick={() => setCurrentQuestionIndex(index)}
										className={`w-9 h-9 rounded-md font-semibold text-xs transition-all hover:scale-105 ${getQuestionBoxColor(
											question.id
										)} ${currentQuestionIndex === index ? "ring-2 ring-blue-300" : ""}`}
									>
										{index + 1}
									</button>
								))}
							</div>

							<div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Total Questions:</span>
									<span className="font-semibold text-gray-900">{DEMO_QUESTIONS.length}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Answered:</span>
									<span className="font-semibold text-green-600">{answeredCount}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Marked for Review:</span>
									<span className="font-semibold text-yellow-600">{reviewCount}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Not Answered:</span>
									<span className="font-semibold text-gray-600">
										{DEMO_QUESTIONS.length - answeredCount}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
