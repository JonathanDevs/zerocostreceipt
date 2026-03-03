import DashboardHeader from "./components/DashboardHeader/DashboardHeader";
import UploadZone from "./components/UploadZone/UploadZone";
import ProcessingQueue from "./components/ProcessingQueue/ProcessingQueue";
import KpiCards from "./components/KpiCards/KpiCards";
import ResultsTable from "./components/ResultsTable/ResultsTable";

export default function DashboardHome() {
    return (
        <>
            <DashboardHeader />
            <UploadZone />
            <ProcessingQueue />
            <KpiCards />
            <ResultsTable />
        </>
    );
}
