import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Zap, Bot, TrendingUp, Shield, Settings, Star,
  CheckCircle2, Calendar, FileText, Users, ArrowRight,
  ChevronDown, ChevronUp, Clock, Database, Mail, MessageSquare,
  Share2, BarChart3, Lightbulb
} from 'lucide-react';
import { planningData } from './planning/planning-data';

const BealerPlanningSection: React.FC = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleProject = (id: string) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  const toggleCheckItem = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const getProjectIcon = (id: string) => {
    switch (id) {
      case 'A': return <TrendingUp className="w-5 h-5" />;
      case 'B': return <Mail className="w-5 h-5" />;
      case 'C': return <Shield className="w-5 h-5" />;
      case 'D': return <MessageSquare className="w-5 h-5" />;
      case 'E': return <Share2 className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  // Map icon names to Lucide components
  const getIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap: Record<string, React.ReactNode> = {
      'target': <Target className={className} />,
      'zap': <Zap className={className} />,
      'bot': <Bot className={className} />,
      'trending-up': <TrendingUp className={className} />,
      'shield': <Shield className={className} />,
      'settings': <Settings className={className} />,
      'star': <Star className={className} />,
    };
    return iconMap[iconName] || <Lightbulb className={className} />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">{planningData.header.title}</h1>
        <p className="text-primary-100 text-lg mb-4">{planningData.header.subtitle}</p>
        <div className="flex flex-wrap gap-4 text-sm text-blue-200">
          <span><strong>For:</strong> {planningData.header.meta.for}</span>
          <span><strong>By:</strong> {planningData.header.meta.by}</span>
          <span><strong>Date:</strong> {planningData.header.meta.date}</span>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Executive Summary</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <div className="text-primary-600 mb-2">{getIcon(planningData.executive.opportunity.icon)}</div>
            <h3 className="font-semibold text-primary-900 mb-2">{planningData.executive.opportunity.title}</h3>
            <p className="text-sm text-gray-600">{planningData.executive.opportunity.description}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="text-amber-600 mb-2">{getIcon(planningData.executive.challenge.icon)}</div>
            <h3 className="font-semibold text-amber-900 mb-2">{planningData.executive.challenge.title}</h3>
            <p className="text-sm text-gray-600">{planningData.executive.challenge.description}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-green-600 mb-2">{getIcon(planningData.executive.solution.icon)}</div>
            <h3 className="font-semibold text-green-900 mb-2">{planningData.executive.solution.title}</h3>
            <p className="text-sm text-gray-600">{planningData.executive.solution.description}</p>
          </div>
        </div>

        {/* Growth Lifecycle */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-center mb-4">Continuous Growth Lifecycle</h3>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {planningData.executive.lifecycle.map((step, index) => (
              <React.Fragment key={step}>
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {step}
                </span>
                {index < planningData.executive.lifecycle.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.section>

      {/* AI Projects */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-2">Five Core AI Projects</h2>
        <p className="text-gray-600 mb-6">Each system solves a specific challenge while creating compounding long-term value</p>

        <div className="space-y-4">
          {planningData.projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold">
                    {project.id}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-gray-500">{project.tagline}</p>
                  </div>
                </div>
                {expandedProject === project.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedProject === project.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 p-4 bg-gray-50"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> The Problem
                      </h4>
                      <ul className="text-sm space-y-1">
                        {project.problem.map((item, i) => (
                          <li key={i} className="text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4" /> AI Solution
                      </h4>
                      <ul className="text-sm space-y-1">
                        {project.solution.map((item, i) => (
                          <li key={i} className="text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Key Data Needed
                      </h4>
                      <ul className="text-sm space-y-1">
                        {project.dataNeeded.map((item, i) => (
                          <li key={i} className="text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-2">Implementation Timeline</h2>
        <p className="text-gray-600 mb-6">{planningData.timeline.intro}</p>

        <div className="space-y-6">
          {planningData.timeline.phases.map((phase, index) => (
            <div key={phase.number} className="relative pl-8 border-l-2 border-primary-200">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {phase.number}
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold">{phase.title}</h3>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    {phase.duration}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 mb-3 grid md:grid-cols-2 gap-1">
                  {phase.tasks.map((task, i) => (
                    <li key={i}>• {task}</li>
                  ))}
                </ul>
                <div className="text-sm bg-primary-50 text-blue-800 p-2 rounded">
                  <strong>Deliverable:</strong> {phase.deliverable}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Metrics */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Success Metrics by Phase</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {planningData.timeline.metrics.map((metric) => (
              <div key={metric.week} className="bg-white p-3 rounded border border-gray-200 text-center">
                <div className="font-bold text-blue-600 mb-1">{metric.week}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Integrated System Benefits</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planningData.benefits.map((benefit) => (
            <div key={benefit.title} className="bg-gray-50 rounded-xl p-4">
              <div className="text-primary-600 mb-2">{getIcon(benefit.icon)}</div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {benefit.items.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Data Requirements */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-2">Data Requirements Checklist</h2>
        <p className="text-gray-600 mb-6">Essential data needed to power the AI systems</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planningData.dataRequirements.map((category, catIndex) => (
            <div key={category.category} className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-3">{catIndex + 1}. {category.category}</h3>
              <ul className="space-y-2">
                {category.items.map((item) => {
                  const itemKey = `${category.category}-${item}`;
                  const isChecked = checkedItems.has(itemKey);
                  return (
                    <li
                      key={item}
                      onClick={() => toggleCheckItem(itemKey)}
                      className={`flex items-start gap-2 cursor-pointer text-sm transition-colors ${
                        isChecked ? 'text-green-600' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isChecked ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <span className={isChecked ? 'line-through' : ''}>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          Click items to mark as collected ({checkedItems.size} of {
            planningData.dataRequirements.reduce((sum, cat) => sum + cat.items.length, 0)
          } items checked)
        </div>
      </motion.section>

      {/* Next Steps */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Next Steps</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {planningData.nextSteps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                {step.number}
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">{planningData.cta.title}</h3>
          <p className="text-primary-100 max-w-3xl mx-auto text-sm">
            {planningData.cta.description}
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>&copy; 2025 AI Growth System Blueprint - Prepared for Derrick Bealer, Allstate Agent</p>
        <p>Confidential - For Internal Use Only</p>
      </div>
    </div>
  );
};

export default BealerPlanningSection;
