import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
}

const defaultRules: Rule[] = [
  {
    id: "multiple-attempts",
    name: "Multiple Failed Attempts",
    description: "Flag accounts with multiple failed verification attempts",
    enabled: true,
    threshold: 3
  },
  {
    id: "ip-anomaly",
    name: "IP Address Anomaly",
    description: "Detect access from unusual locations or IP addresses",
    enabled: true
  },
  {
    id: "unusual-timing",
    name: "Unusual Access Timing",
    description: "Detect access at unusual hours or patterns",
    enabled: true
  },
  {
    id: "identity-mismatch",
    name: "Identity Mismatch",
    description: "Detect when submitted identity information differs from records",
    enabled: true
  },
  {
    id: "rapid-changes",
    name: "Rapid Profile Changes",
    description: "Flag accounts with frequent or unusual profile changes",
    enabled: false
  }
];

const FraudRules = () => {
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const { toast } = useToast();

  const updateRulesMutation = useMutation({
    mutationFn: async (updatedRules: Rule[]) => {
      const response = await apiRequest("POST", "/api/fraud/rules", updatedRules);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fraud/rules'] });
      toast({
        title: "Success",
        description: "Fraud detection rules updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update rules",
        variant: "destructive",
      });
    },
  });

  const handleRuleToggle = (id: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
  };

  const handleThresholdChange = (id: string, value: string) => {
    const threshold = parseInt(value);
    if (!isNaN(threshold)) {
      const updatedRules = rules.map(rule => 
        rule.id === id ? { ...rule, threshold } : rule
      );
      setRules(updatedRules);
    }
  };

  const handleSaveRules = () => {
    updateRulesMutation.mutate(rules);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Fraud Detection Rules</h3>
      </div>
      <div className="p-5">
        <p className="text-sm text-[#525252] mb-4">
          Configure rules to identify suspicious activities and potential fraud.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          {rules.map((rule) => (
            <AccordionItem key={rule.id} value={rule.id}>
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-[#42be65]' : 'bg-[#8d8d8d]'} mr-3`}></div>
                    <span>{rule.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={() => handleRuleToggle(rule.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-7">
                <div className="pb-4">
                  <p className="text-sm text-[#525252] mb-3">{rule.description}</p>
                  
                  {rule.threshold !== undefined && (
                    <div className="flex items-center mt-3 space-x-4">
                      <Label htmlFor={`threshold-${rule.id}`} className="w-24 text-[#525252]">
                        Threshold:
                      </Label>
                      <Input
                        id={`threshold-${rule.id}`}
                        type="number"
                        min="1"
                        max="10"
                        value={rule.threshold}
                        onChange={(e) => handleThresholdChange(rule.id, e.target.value)}
                        className="w-20"
                        disabled={!rule.enabled}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSaveRules}
            className="bg-[#0f62fe] hover:bg-blue-700 text-white"
            disabled={updateRulesMutation.isPending}
          >
            {updateRulesMutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
              </span>
            ) : (
              "Save Rules"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FraudRules;
