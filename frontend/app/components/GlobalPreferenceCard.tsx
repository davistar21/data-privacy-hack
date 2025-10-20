import { useWebPrivacyStore } from "../stores/WebPrivacyStore";
import { toast } from "sonner";

export default function GlobalPreferenceCard() {
  const { globalPreference, setGlobalPreference } = useWebPrivacyStore();
  ``;
  const handleChange = (pref: any) => {
    setGlobalPreference(pref);
    toast.success(`Global cookie preference set to: ${pref.replace("_", " ")}`);
  };

  return (
    <div className="p-4 bg-slate-800/50 dark:bg-white/10 rounded-xl mb-6">
      <h3 className="text-lg font-semibold mb-2">Global Cookie Preference</h3>
      <div className="flex gap-4">
        {["accept_all", "essential_only", "reject_all"].map((pref) => (
          <label key={pref} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="cookiePref"
              checked={globalPreference === pref}
              onChange={() => handleChange(pref)}
              className="accent-green-500"
            />
            <span className="capitalize">{pref.replace("_", " ")}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
