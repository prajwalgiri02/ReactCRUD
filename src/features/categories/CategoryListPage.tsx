"use client";

import { CrudPage } from "@/crud/CrudPage";
import { CrudTable } from "@/crud/components/CrudTable";
import { categoryColumns } from "./columns";
import { categoryResource } from "./index";
import { categoryRoutes } from "./routes";
import type { Category } from "@/crud/mock/mockDb";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

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
              <Button variant="outline" className="rounded-xl gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" className="rounded-xl gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </>
          }
          onBulkDelete={async (ids) => {
            // implement your resource bulk delete (API call)
            // await categoryResource.bulkDelete(ids)
            console.log("bulk delete", ids);
          }}
          bulkActions={({ selectedIds, selectedCount, clear }) => (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl"
                onClick={() => {
                  // open bulk edit modal / route
                  // example: router.push(`${categoryRoutes.bulkEdit}?ids=${selectedIds.join(",")}`)
                  console.log("bulk edit", selectedIds);
                }}
              >
                Bulk edit ({selectedCount})
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl"
                onClick={async () => {
                  // custom bulk action
                  // await categoryResource.bulkActivate(selectedIds)
                  console.log("bulk activate", selectedIds);
                  clear(); // optional: clear selection after action
                }}
              >
                Activate
              </Button>
            </>
          )}
        />
      )}
    />
  );
}
