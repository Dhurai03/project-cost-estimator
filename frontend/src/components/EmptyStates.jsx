// Empty state illustrations for various scenarios

export const EmptyProjects = ({ onCreate }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* SVG Illustration */}
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                <svg className="w-12 h-12 text-indigo-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400/20 rounded-full border border-emerald-400/30 flex items-center justify-center">
                <span className="text-xs">✦</span>
            </div>
        </div>
        <h3 className="text-white font-semibold text-base mb-1.5">No projects yet</h3>
        <p className="text-gray-500 text-sm mb-5 max-w-xs leading-relaxed">
            Start by creating your first cost estimate using one of our powerful estimation tools.
        </p>
        {onCreate && (
            <button
                onClick={onCreate}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
            >
                + Create First Estimate
            </button>
        )}
    </div>
);

export const EmptySearch = ({ query, onClear }) => (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
        <div className="relative mb-5">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <svg className="w-10 h-10 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 text-lg">🔍</div>
        </div>
        <h3 className="text-white font-semibold text-base mb-1.5">No results found</h3>
        <p className="text-gray-500 text-sm mb-4 max-w-xs">
            No matches for <span className="text-amber-400 font-medium">"{query}"</span>. Try a different search term.
        </p>
        {onClear && (
            <button
                onClick={onClear}
                className="px-4 py-2 bg-[#2A313C] hover:bg-[#3A424F] text-gray-300 text-sm rounded-lg transition-all duration-200 border border-[#3A424F]"
            >
                Clear Search
            </button>
        )}
    </div>
);

export const WelcomeCard = ({ userName, onStart }) => (
    <div className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-[#151A22] rounded-xl border border-indigo-500/30 p-6 overflow-hidden mb-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-500/10 rounded-full translate-y-14 -translate-x-14" />

        <div className="relative">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl border border-indigo-500/30 shrink-0">
                    👋
                </div>
                <div className="flex-1">
                    <h2 className="text-white font-semibold text-lg mb-1">
                        Welcome{userName ? `, ${userName}` : ''}! Ready to estimate?
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        ProjectCostPro gives you three powerful estimation methods — FPA, Analogy-Based, and COCOMO II. Each method provides different insights into your project's cost.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onStart?.('fpa')}
                            className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition-all"
                        >
                            📐 Try FPA
                        </button>
                        <button
                            onClick={() => onStart?.('analogy')}
                            className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-all"
                        >
                            🔍 Try Analogy
                        </button>
                        <button
                            onClick={() => onStart?.('cocomo')}
                            className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/30 transition-all"
                        >
                            ⚙️ Try COCOMO II
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const EmptyTabState = ({ icon, title, description, actionLabel, onAction }) => (
    <tr>
        <td colSpan={6} className="px-6 py-0">
            <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 bg-[#1E252E] rounded-full flex items-center justify-center text-3xl mb-4 border border-[#2A313C]">
                    {icon}
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
                <p className="text-gray-500 text-xs mb-4 max-w-xs">{description}</p>
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="px-4 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/30 transition-all"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </td>
    </tr>
);
