// Skeleton loading components for data-fetching states

const shimmer = "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent overflow-hidden relative";

// ─── SkeletonCard ────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
    <div className={`bg-[#151A22] rounded-xl border border-[#2A313C] p-5 ${shimmer}`}>
        <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-[#2A313C] rounded-lg animate-pulse" />
        </div>
        <div className="h-7 w-28 bg-[#2A313C] rounded-md animate-pulse mb-2" />
        <div className="h-3.5 w-36 bg-[#2A313C] rounded animate-pulse mb-1.5" />
        <div className="h-3 w-24 bg-[#2A313C] rounded animate-pulse" />
    </div>
);

// ─── SkeletonChart ───────────────────────────────────────────────────────────
export const SkeletonChart = ({ height = 220 }) => (
    <div className={`w-full ${shimmer}`} style={{ height }}>
        {/* Y-axis lines */}
        <div className="flex flex-col justify-between h-full py-2 pr-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-2.5 bg-[#2A313C] rounded animate-pulse shrink-0" />
                    <div className="flex-1 h-px bg-[#2A313C]/60" />
                </div>
            ))}
        </div>
        {/* Bars at bottom */}
        <div className="absolute bottom-4 left-10 right-4 flex items-end gap-2 h-3/5">
            {[60, 80, 50, 90, 70, 55, 85, 65, 75, 45, 95, 40].map((h, i) => (
                <div
                    key={i}
                    className="flex-1 bg-[#2A313C] rounded-t-sm animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                />
            ))}
        </div>
    </div>
);

// ─── SkeletonPieChart ────────────────────────────────────────────────────────
export const SkeletonPieChart = () => (
    <div className={`flex flex-col items-center gap-4 ${shimmer}`}>
        <div className="w-36 h-36 rounded-full border-8 border-[#2A313C] animate-pulse relative">
            <div className="absolute inset-4 rounded-full bg-[#151A22]" />
        </div>
        <div className="w-full space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2A313C] animate-pulse" />
                        <div className="h-3 w-16 bg-[#2A313C] rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-14 bg-[#2A313C] rounded animate-pulse" />
                </div>
            ))}
        </div>
    </div>
);

// ─── SkeletonTable ───────────────────────────────────────────────────────────
export const SkeletonTableRows = ({ rows = 5, cols = 6 }) => (
    <>
        {[...Array(rows)].map((_, ri) => (
            <tr key={ri} className="border-b border-[#2A313C]">
                {[...Array(cols)].map((_, ci) => (
                    <td key={ci} className="px-6 py-4">
                        <div
                            className="h-4 bg-[#2A313C] rounded animate-pulse"
                            style={{
                                width: ci === 0 ? '60px' : ci === 1 ? '120px' : ci === cols - 1 ? '70px' : '80px',
                                animationDelay: `${(ri * cols + ci) * 0.04}s`,
                            }}
                        />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

// ─── SkeletonActivityItem ────────────────────────────────────────────────────
export const SkeletonActivityItem = () => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F15] border border-[#2A313C]">
        <div className="flex items-center gap-3">
            <div className="w-14 h-5 bg-[#2A313C] rounded animate-pulse" />
            <div>
                <div className="h-4 w-28 bg-[#2A313C] rounded animate-pulse mb-1.5" />
                <div className="h-3 w-20 bg-[#2A313C] rounded animate-pulse" />
            </div>
        </div>
        <div className="h-4 w-20 bg-[#2A313C] rounded animate-pulse" />
    </div>
);
