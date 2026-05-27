import { Separator } from "@/components/ui/separator";

type ContentSectionProps = {
  title?: string;
  desc?: string;
  children: React.JSX.Element;
  header?: boolean;
};

export function ContentSection({ title, desc, children, header = true }: ContentSectionProps) {
  return (
    <div className="flex flex-1 flex-col">
      {header && (
        <>
          <div className="flex-none">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
          </div>
          {title && desc && <Separator className="my-4 flex-none" />}
        </>
      )}
      <div className="h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12">
        <div className="-mx-1 px-1.5 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
