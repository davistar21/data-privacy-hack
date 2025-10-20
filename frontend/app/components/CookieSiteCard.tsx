import {
  useWebPrivacyStore,
  type CookiePreference,
} from "../stores/WebPrivacyStore";
import { toast } from "sonner";

interface Props {
  site: {
    id: string;
    name: string;
    domain: string;
    status: CookiePreference;
  };
}

export default function CookieSiteCard({ site }: Props) {
  const { toggleWebsiteStatus } = useWebPrivacyStore();

  const handleChange = (status: CookiePreference) => {
    toggleWebsiteStatus(site.id, status);
    toast.success(
      `${site.name}: cookie status set to ${status.replace("_", " ")}`
    );
  };

  return (
    <div className="p-4 bg-slate-800/40 dark:bg-white/10 rounded-xl border border-slate-700">
      <h4 className="font-semibold">{site.name}</h4>
      <p className="text-sm text-gray-400 mb-3">{site.domain}</p>

      <div className="flex flex-wrap gap-3">
        {["accept_all", "essential_only", "reject_all"].map((status) => (
          <button
            key={status}
            onClick={() => handleChange(status as CookiePreference)}
            className={`px-3 py-1 rounded-md text-sm transition ${
              site.status === status
                ? "bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
