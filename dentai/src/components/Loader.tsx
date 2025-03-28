const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-blue-400  border-b-transparent rounded-full animate-[spin_1.5s_linear_infinite] opacity-75"></div>
      </div>
    </div>
  );
};

export default Loader;
