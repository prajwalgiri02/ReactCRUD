import { CrudPage } from "@/crud/CrudPage";
import { CrudTable } from "@/crud/components/CrudTable";
import { categoryColumns } from "./columns";
import { categoryResource } from "./index";
import { categoryRoutes } from "./routes";
import type { Category } from "@/crud/mock/mockDb";
import { Button } from "@/components/ui/button";

export function CategoryListPage() {
  return (
    <CrudPage<Category>
      title="Categories"
      resource={categoryResource}
      columns={categoryColumns as any}
      getId={(row: any) => row.id}
      defaultParams={{ perPage: 12 }}
      createPath={categoryRoutes.create}
      editPath={(row: any) => categoryRoutes.edit(row.id)}
        Table={(props) => (
    <CrudTable
      {...props}
      toolbarActions={
        <>
          <Button variant="outline" className="rounded-2xl">Export</Button>
          <Button variant="outline" className="rounded-2xl">Filters</Button>
        </>
      }
    />
  )}
    />
  );
}
