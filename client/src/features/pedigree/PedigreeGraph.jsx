import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Info, User, Activity, AlertCircle, Heart } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { getRelationshipDefinition } from '../../utils/relationshipHelper';

export const PedigreeGraph = ({ members = [], relationships = [], conditions = [], onSelectMember }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    if (!svgRef.current || members.length === 0) return;

    const width = containerRef.current?.clientWidth || 900;
    const height = 550;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup main zoomable container
    const g = svg.append('g').attr('class', 'pedigree-main-group');

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // --- 1. Compute Generations & Node Positions ---
    // Map relationships for parenting & partnership
    const parentsMap = {}; // childId -> [parentId]
    const childrenMap = {}; // parentId -> [childId]
    const couples = []; // [{ from, to, id }]

    members.forEach(m => {
      parentsMap[m._id] = [];
      childrenMap[m._id] = [];
    });

    relationships.forEach(rel => {
      const fromId = (rel.fromMemberId?._id || rel.fromMemberId)?.toString();
      const toId = (rel.toMemberId?._id || rel.toMemberId)?.toString();

      if (!fromId || !toId || !parentsMap[fromId] || !parentsMap[toId]) return;

      const def = getRelationshipDefinition(rel.type);
      const baseType = rel.metadata?.baseType || def.baseType;
      const isBio = rel.metadata?.isBiological !== undefined ? rel.metadata.isBiological : def.isBiological;
      const dir = rel.metadata?.direction || def.direction;

      if (baseType === 'PARENT_CHILD' && isBio) {
        if (dir === 'CHILD_TO_PARENT') {
          parentsMap[fromId].push(toId);
          childrenMap[toId].push(fromId);
        } else {
          parentsMap[toId].push(fromId);
          childrenMap[fromId].push(toId);
        }
      } else if (baseType === 'SPOUSE' || baseType === 'PARTNER') {
        couples.push({ from: fromId, to: toId, type: rel.type });
      }
    });

    // Assign generation depth using topological depth
    const generationMap = {};
    const proband = members.find(m => m.isProband) || members[0];

    // Find roots (members without parents recorded)
    function assignGenerations() {
      // Find members with no parents (roots)
      const roots = members.filter(m => (parentsMap[m._id] || []).length === 0);

      // Depth first traversal
      function traverse(id, gen) {
        generationMap[id] = Math.max(generationMap[id] || 0, gen);
        (childrenMap[id] || []).forEach(childId => {
          traverse(childId, gen + 1);
        });
      }

      roots.forEach(root => {
        traverse(root._id, 1);
      });

      // Synchronize couples to the same generation level
      couples.forEach(({ from, to }) => {
        const gFrom = generationMap[from] || 1;
        const gTo = generationMap[to] || 1;
        const maxGen = Math.max(gFrom, gTo);
        generationMap[from] = maxGen;
        generationMap[to] = maxGen;
      });

      // Align extended relationships (grandparents, aunts/uncles, cousins)
      relationships.forEach(rel => {
        const fromId = (rel.fromMemberId?._id || rel.fromMemberId)?.toString();
        const toId = (rel.toMemberId?._id || rel.toMemberId)?.toString();
        if (!fromId || !toId) return;

        const def = getRelationshipDefinition(rel.type);
        const baseType = rel.metadata?.baseType || def.baseType;

        if (baseType === 'GRANDPARENT') {
          if (def.direction !== 'CHILD_TO_PARENT') {
            if (generationMap[toId] && !generationMap[fromId]) {
              generationMap[fromId] = Math.max(1, generationMap[toId] - 2);
            }
          }
        } else if (baseType === 'AUNT_UNCLE') {
          if (generationMap[toId] && !generationMap[fromId]) {
            generationMap[fromId] = Math.max(1, generationMap[toId] - 1);
          }
        } else if (baseType === 'COUSIN') {
          if (generationMap[toId] && !generationMap[fromId]) {
            generationMap[fromId] = generationMap[toId];
          } else if (generationMap[fromId] && !generationMap[toId]) {
            generationMap[toId] = generationMap[fromId];
          }
        }
      });

      // Fallback for isolated nodes
      members.forEach(m => {
        if (!generationMap[m._id]) {
          generationMap[m._id] = 2;
        }
      });
    }

    assignGenerations();

    // Group members by generation
    const genGroups = {};
    members.forEach(m => {
      const gen = generationMap[m._id] || 1;
      if (!genGroups[gen]) genGroups[gen] = [];
      genGroups[gen].push(m);
    });

    const generations = Object.keys(genGroups).map(Number).sort((a, b) => a - b);

    // Calculate (x, y) coordinates for each member
    const nodeCoords = {};
    const ySpacing = 130;
    const xSpacing = 140;

    generations.forEach((gen, genIdx) => {
      const genMembers = genGroups[gen];
      const rowWidth = genMembers.length * xSpacing;
      const startX = (width - rowWidth) / 2 + xSpacing / 2;
      const y = 80 + genIdx * ySpacing;

      genMembers.forEach((m, idx) => {
        nodeCoords[m._id] = {
          x: startX + idx * xSpacing,
          y: y,
          member: m
        };
      });
    });

    // --- 2. Render Relationship Lines ---
    const linesGroup = g.append('g').attr('class', 'relationship-lines');

    // Couple Partnership lines
    const partnershipKnots = {}; // "m1-m2" -> { x, y }

    couples.forEach(({ from, to, type }) => {
      const p1 = nodeCoords[from];
      const p2 = nodeCoords[to];
      if (!p1 || !p2) return;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const coupleKey = [from, to].sort().join('-');
      partnershipKnots[coupleKey] = { x: midX, y: midY, p1, p2 };

      // Horizontal marriage line
      linesGroup.append('line')
        .attr('x1', p1.x)
        .attr('y1', p1.y)
        .attr('x2', p2.x)
        .attr('y2', p2.y)
        .attr('stroke', '#475569')
        .attr('stroke-width', 2.5);

      // Consanguinity indicator: double line if marked
      if (type === 'PARTNER') {
        // subtle dash for non-married partners
        linesGroup.append('line')
          .attr('x1', p1.x)
          .attr('y1', p1.y + 4)
          .attr('x2', p2.x)
          .attr('y2', p2.y + 4)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,3');
      }
    });

    // Parent -> Child Descent lines
    members.forEach(child => {
      const parents = parentsMap[child._id] || [];
      const childCoord = nodeCoords[child._id];
      if (!childCoord) return;

      if (parents.length >= 2) {
        // Both parents known: connect from partnership knot
        const coupleKey = [parents[0], parents[1]].sort().join('-');
        const knot = partnershipKnots[coupleKey];

        if (knot) {
          // Vertical drop from marriage line
          const dropY = knot.y + 45;
          linesGroup.append('line')
            .attr('x1', knot.x)
            .attr('y1', knot.y)
            .attr('x2', knot.x)
            .attr('y2', dropY)
            .attr('stroke', '#64748b')
            .attr('stroke-width', 2);

          // Horizontal branch to child
          linesGroup.append('line')
            .attr('x1', knot.x)
            .attr('y1', dropY)
            .attr('x2', childCoord.x)
            .attr('y2', dropY)
            .attr('stroke', '#64748b')
            .attr('stroke-width', 2);

          // Final drop to child node
          linesGroup.append('line')
            .attr('x1', childCoord.x)
            .attr('y1', dropY)
            .attr('x2', childCoord.x)
            .attr('y2', childCoord.y - 25)
            .attr('stroke', '#64748b')
            .attr('stroke-width', 2);
        }
      } else if (parents.length === 1) {
        // Single parent link
        const parentCoord = nodeCoords[parents[0]];
        if (parentCoord) {
          const midY = (parentCoord.y + childCoord.y) / 2;
          linesGroup.append('path')
            .attr('d', `M ${parentCoord.x} ${parentCoord.y + 25} V ${midY} H ${childCoord.x} V ${childCoord.y - 25}`)
            .attr('fill', 'none')
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2);
        }
      }
    });

    // --- 3. Render Member Nodes ---
    const nodesGroup = g.append('g').attr('class', 'pedigree-nodes');

    // Index conditions by memberId
    const conditionMap = {};
    conditions.forEach(c => {
      const mId = (c.memberId?._id || c.memberId)?.toString();
      if (!conditionMap[mId]) conditionMap[mId] = [];
      conditionMap[mId].push(c);
    });

    members.forEach(m => {
      const coord = nodeCoords[m._id];
      if (!coord) return;

      const memberConditions = conditionMap[m._id] || [];
      const isAffected = memberConditions.some(c => c.status === 'AFFECTED');
      const isCarrier = memberConditions.some(c => c.status === 'CARRIER');

      const nodeG = nodesGroup.append('g')
        .attr('transform', `translate(${coord.x}, ${coord.y})`)
        .attr('class', 'cursor-pointer group')
        .on('click', () => {
          setSelectedNode({
            member: m,
            conditions: memberConditions,
            parents: (parentsMap[m._id] || []).map(pId => members.find(x => x._id === pId)),
            children: (childrenMap[m._id] || []).map(cId => members.find(x => x._id === cId))
          });
          if (onSelectMember) onSelectMember(m);
        });

      // Symbol Shape based on Sex
      const size = 36;
      let fill = '#ffffff';
      let stroke = '#1e293b';

      if (isAffected) {
        fill = '#ef4444'; // Red fill for affected
        stroke = '#991b1b';
      }

      if (m.sex === 'MALE') {
        // Square for male
        nodeG.append('rect')
          .attr('x', -size / 2)
          .attr('y', -size / 2)
          .attr('width', size)
          .attr('height', size)
          .attr('rx', 3)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', m.isProband ? 3 : 2)
          .attr('class', 'transition-transform duration-150 hover:scale-110');
      } else if (m.sex === 'FEMALE') {
        // Circle for female
        nodeG.append('circle')
          .attr('r', size / 2)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', m.isProband ? 3 : 2)
          .attr('class', 'transition-transform duration-150 hover:scale-110');
      } else {
        // Diamond for unknown/other
        const d = size / 1.4;
        nodeG.append('polygon')
          .attr('points', `0,-${d} ${d},0 0,${d} -${d},0`)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', m.isProband ? 3 : 2)
          .attr('class', 'transition-transform duration-150 hover:scale-110');
      }

      // Carrier Dot (centered circle if carrier and not solid affected)
      if (isCarrier && !isAffected) {
        nodeG.append('circle')
          .attr('r', 5)
          .attr('fill', '#0f172a');
      }

      // Deceased Slash: diagonal line through symbol
      if (m.deceased) {
        nodeG.append('line')
          .attr('x1', -size / 1.5)
          .attr('y1', size / 1.5)
          .attr('x2', size / 1.5)
          .attr('y2', -size / 1.5)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2);
      }

      // Proband Arrow: standard medical pedigree arrow pointing to lower-left
      if (m.isProband) {
        const arrowG = nodeG.append('g').attr('transform', 'translate(-28, 28) rotate(-45)');
        arrowG.append('line')
          .attr('x1', 0).attr('y1', 0)
          .attr('x2', 14).attr('y2', 0)
          .attr('stroke', '#0d9488')
          .attr('stroke-width', 3);
        arrowG.append('polygon')
          .attr('points', '14,-4 22,0 14,4')
          .attr('fill', '#0d9488');
        arrowG.append('text')
          .attr('x', -8)
          .attr('y', 4)
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', '#0d9488')
          .text('P');
      }

      // Member Name Label
      nodeG.append('text')
        .attr('y', size / 2 + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', m.isProband ? '700' : '500')
        .attr('fill', '#1e293b')
        .text(m.name.length > 14 ? m.name.slice(0, 12) + '...' : m.name);

      // Condition Tag Badge if affected/carrier
      if (memberConditions.length > 0) {
        const tagText = memberConditions[0].conditionId?.code || 'COND';
        nodeG.append('text')
          .attr('y', size / 2 + 28)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', isAffected ? '#b91c1c' : '#0369a1')
          .text(tagText);
      }
    });

    // Default select proband
    if (proband) {
      setSelectedNode({
        member: proband,
        conditions: conditionMap[proband._id] || [],
        parents: (parentsMap[proband._id] || []).map(pId => members.find(x => x._id === pId)),
        children: (childrenMap[proband._id] || []).map(cId => members.find(x => x._id === cId))
      });
    }

    // Zoom controls binding
    d3.select('#btn-zoom-in').on('click', () => svg.transition().call(zoom.scaleBy, 1.25));
    d3.select('#btn-zoom-out').on('click', () => svg.transition().call(zoom.scaleBy, 0.8));
    d3.select('#btn-zoom-reset').on('click', () => {
      svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    });

  }, [members, relationships, conditions]);

  return (
    <div className="relative w-full bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button
          id="btn-zoom-in"
          title="Zoom In"
          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          title="Zoom Out"
          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          title="Reset View"
          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
            showLegend ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Info className="w-3.5 h-3.5" /> Legend
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-[550px] bg-gradient-to-b from-slate-50 to-slate-100/50 cursor-grab active:cursor-grabbing"
      ></svg>

      {/* Interactive Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-sm text-xs space-y-2 max-w-xs">
          <div className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1">
            <span>Pedigree Nomenclature</span>
            <span className="text-[10px] text-slate-400">Standard</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-slate-800 bg-white"></div>
              <span>Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-slate-800 rounded-full bg-white"></div>
              <span>Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-red-800 bg-red-500"></div>
              <span>Affected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-slate-800 rounded-full bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
              </div>
              <span>Carrier</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-3.5 h-3.5 border border-slate-800 bg-white">
                <div className="absolute inset-0 border-t border-slate-800 rotate-45 top-1.5"></div>
              </div>
              <span>Deceased</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-600">P ↗</span>
              <span>Proband</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Member Details Drawer / Card */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-800 text-sm">{selectedNode.member.name}</h4>
                {selectedNode.member.isProband && (
                  <Badge variant="brand" size="sm">Proband</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 capitalize">
                {selectedNode.member.sex?.toLowerCase()} • {selectedNode.member.deceased ? 'Deceased' : 'Living'}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {selectedNode.member.dateOfBirth && (
              <div>
                <span className="text-slate-400">Date of Birth:</span>{' '}
                <span className="font-medium text-slate-700">
                  {new Date(selectedNode.member.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Conditions Section */}
            <div>
              <span className="text-slate-400 font-medium block mb-1">Medical Conditions:</span>
              {selectedNode.conditions.length === 0 ? (
                <p className="text-slate-500 italic">No genetic or medical conditions documented.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedNode.conditions.map(c => (
                    <div key={c._id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{c.conditionId?.name || 'Condition'}</span>
                        <Badge
                          variant={c.status === 'AFFECTED' ? 'danger' : 'info'}
                          size="sm"
                        >
                          {c.status}
                        </Badge>
                      </div>
                      {c.ageAtOnset !== null && c.ageAtOnset !== undefined && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Age of onset: {c.ageAtOnset} years
                        </p>
                      )}
                      {c.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">"{c.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedNode.member.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium block mb-0.5">Notes:</span>
                <p className="text-slate-600 italic">{selectedNode.member.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
