import { motion } from 'framer-motion';

// ─── Icon Components ──────────────────────────────────────────────────────────
const Icon = ({ d }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d={d} clipRule="evenodd" />
  </svg>
);
const PlayIcon  = () => <Icon d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />;
const PauseIcon = () => <Icon d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" />;
const BackIcon  = () => <Icon d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.54V7.19c0-1.441-1.555-2.343-2.805-1.629l-8.362 4.77c-1.247.712-1.247 2.544 0 3.257l8.362 4.852Z" />;
const FwdIcon   = () => <Icon d="M14.805 5.56c-1.25-.714-2.805.189-2.805 1.629v2.34L5.055 5.56C3.805 4.846 2.25 5.749 2.25 7.19v9.62c0 1.44 1.555 2.343 2.805 1.628L12 14.46v2.34c0 1.44 1.555 2.343 2.805 1.629l8.362-4.77c1.247-.712 1.247-2.544 0-3.257L14.805 5.56Z" />;
const ResetIcon = () => <Icon d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903H14.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v3.068l-1.97-1.97A9 9 0 0 0 3.305 9.63a.75.75 0 1 0 1.45.388ZM20.695 14.37a.75.75 0 0 0-1.45-.388 7.5 7.5 0 0 1-12.548 3.364L4.794 15.44H9.75a.75.75 0 0 0 0-1.5h-6a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-3.068l1.97 1.97a9 9 0 0 0 14.225-5.222Z" />;
const ShuffleIcon = () => <Icon d="M15.97 2.47a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H12a.75.75 0 0 1 0-1.5h5.69l-1.72-1.72a.75.75 0 0 1 0-1.06Zm-7.94 12a.75.75 0 0 1 0 1.06l-1.72 1.72H12a.75.75 0 0 1 0 1.5H6.31l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0ZM2.25 7.5a.75.75 0 0 1 .75-.75h3.69l7.28 9.75H18a.75.75 0 0 1 0 1.5h-3.69l-.6-.8a.75.75 0 0 1 .12-1.05l.6.45.6-.8L8.03 6.75H3A.75.75 0 0 1 2.25 7.5Z" />;

function Btn({ onClick, disabled, title, variant = 'default', children }) {
  const base = 'flex items-center justify-center rounded-xl p-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed';
  const variants = {
    default:  'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white',
    primary:  'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25',
    danger:   'bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-400',
    success:  'bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400',
  };
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.08 }}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      onClick={onClick} disabled={disabled} title={title}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </motion.button>
  );
}

export default function Controls({
  isPlaying, onPlayPause, onStepForward, onStepBack,
  onReset, onShuffle, speed, onSpeedChange,
  currentStep, totalSteps, isSorting, isComplete,
  // Array-size slider 
  arraySize, onArraySizeChange,
}) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const showArraySlider = arraySize !== undefined && onArraySizeChange !== undefined;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.12 }}
        />
      </div>

      {/* Step counter */}
      <div className="flex justify-between text-xs font-mono text-slate-500">
        <span>Step {currentStep} / {totalSteps}</span>
        <span>{isComplete ? '✓ Done' : isSorting ? 'Running…' : 'Ready'}</span>
      </div>

      {/* Playback buttons */}
      <div className="flex items-center justify-center gap-3">
        <Btn onClick={onShuffle}      disabled={isSorting}                       title="New array"     variant="success"><ShuffleIcon /></Btn>
        <Btn onClick={onStepBack}     disabled={currentStep <= 0 || isPlaying}   title="Step back"                      ><BackIcon /></Btn>
        <Btn onClick={onPlayPause}    disabled={isComplete && !isPlaying}        title={isPlaying ? 'Pause' : 'Play'}  variant="primary">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Btn>
        <Btn onClick={onStepForward}  disabled={currentStep >= totalSteps || isPlaying} title="Step forward"><FwdIcon /></Btn>
        <Btn onClick={onReset}        disabled={currentStep === 0 || isPlaying}  title="Reset"        variant="danger" ><ResetIcon /></Btn>
      </div>

      {/* Sliders — speed always shown, array size only for sort pages */}
      <div className={`grid gap-6 pt-1 ${showArraySlider ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span className="uppercase tracking-wider">Speed</span>
            <span className="font-mono text-indigo-400">{speed}ms</span>
          </div>
          <input type="range" min="10" max="1000" step="10"
            value={speed} onChange={e => onSpeedChange(Number(e.target.value))}
            className="slider w-full" />
        </div>

        {showArraySlider && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span className="uppercase tracking-wider">Array Size</span>
              <span className="font-mono text-purple-400">{arraySize}</span>
            </div>
            <input type="range" min="5" max="80" step="1"
              value={arraySize} onChange={e => onArraySizeChange(Number(e.target.value))}
              disabled={isSorting} className="slider w-full disabled:opacity-30" />
          </div>
        )}
      </div>
    </div>
  );
}
